const BinanceApiClient = require('./core/api');
const BinanceWebSocketClient = require('./core/websocket');
const { apiKey } = require('./secrets');

const createLogger = require('./core/logger');


const sortByVolume = (a, b) => {
    if (a.volume > b.volume) {
        return -1;
    }
    if (a.volume < b.volume) {
        return 1;
    }
    return 0;
};

const filterNonZeroVolume = ({volume}) => volume > 0;

/**
 * @param {*} allPairs 
 * @param {*} limit 
 * @param {*} offset 
 * @returns 
 */
const getHighestVolumePairs = (allPairs, limit = 10, offset = 0) => {
    const volumes = allPairs
        .map(({symbol, volume}) => ({symbol, volume: parseFloat(volume)}))
        .filter(filterNonZeroVolume)
        .sort(sortByVolume);

    return volumes.slice(offset, limit)
        .map(({ symbol }) => symbol);
}


const highestVolumeTrades = async () => {
    const logger = createLogger('Trades');

    const api = new BinanceApiClient({
        apiKey,
        baseUrl: 'https://api.binance.com',
        logger
    });

    
    const wsClient = new BinanceWebSocketClient({
        wsUrl: 'wss://stream.binance.com:9443',
        logger
    });
    
    const highestVolumePairLimit = 10;
    
    const { data: allPairs } = await api.getTicker24hr();
    const highestVolumePairs = getHighestVolumePairs(allPairs, highestVolumePairLimit);

    highestVolumePairs.forEach(pair => {
        wsClient.tradeWS(pair, (response) => {
            const event = JSON.parse(response);
            logger.info(event);
            // const eventTime = event.E
            // monitor.register(eventTime);
            // console.log(`${event.s}: ${event.p} ${event.q} ${event.E}`);
        });
    });
}


module.exports = highestVolumeTrades;