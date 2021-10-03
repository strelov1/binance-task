const BinanceApiClient = require('./core/api');
const BinanceWebSocketClient = require('./core/websocket');
const Monitor = require('./core/monitor');
const createLogger = require('./core/logger');

const { apiKey } = require('./secrets');


const sortByVolume = (a, b) => {
    if (a.volume > b.volume) {
        return -1;
    }
    if (a.volume < b.volume) {
        return 1;
    }
    return 0;
};

const filterNonZeroVolume = ({ volume }) => volume > 0;

/**
 * @param {Array<string>} allPairs 
 * @param {number} limit 
 * @param {number} offset 
 * @returns 
 */
const getHighestVolumePairs = (allPairs, limit = 10, offset = 0) => {
    const volumes = allPairs
        .map(({ symbol, volume }) => ({ symbol, volume: parseFloat(volume) }))
        .filter(filterNonZeroVolume)
        .sort(sortByVolume);

    return volumes.slice(offset, limit)
        .map(({ symbol }) => symbol);
}

/**
 * 
 */
const highestVolumeTradesWatcher = async () => {
    const logger = createLogger('Trades');

    const apiClient = new BinanceApiClient({
        apiKey,
        baseUrl: 'https://api.binance.com',
        logger,
    });

    const wsClient = new BinanceWebSocketClient({
        wsUrl: 'wss://stream.binance.com:9443',
        logger,
    });

    const monitor = new Monitor();
    
    const highestVolumePairLimit = 10;
    const showStatMonitorTime = 60 * 1000; // 1m
    
    logger.info(`Getting all trade pairs in the last 24h...`);
    const { data: allPairs } = await apiClient.getTicker24hr();
    const highestVolumePairs = getHighestVolumePairs(allPairs, highestVolumePairLimit);

    let wsRefs = [];
    highestVolumePairs.forEach(pair => {
        const ref = wsClient.trade(pair, (response) => {
            const event = JSON.parse(response);
            logger.info(`${event.s} | ${event.p} ${event.q} ${event.E}`);
            const eventTime = parseInt(event.E);
            monitor.register(eventTime);
        });
        wsRefs.push(ref);
    });

    setTimeout(() => {
        wsRefs.forEach((ref) => ref.unsubscribe());
    }, 5000);
    
    setInterval(() => {
        try {
            const { min, max, mean } = monitor.getStats();
            logger.info(`Latencies: Min ${min} | Max: ${max} | Mean ${mean}`);
        } catch (e) {
            logger.error('Empty stats');
        }
    }, showStatMonitorTime);
}


module.exports = highestVolumeTradesWatcher;