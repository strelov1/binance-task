const BinanceApiClient = require('./core/api');
const BinanceWebSocketClient = require('./core/websocket');
const Balance = require('./core/balance');
const createLogger = require('./core/logger');

const { apiKey, apiSecret } = require('./secrets');

const convertEventToAccountBalance = (data) => {
    return data.map(balance => ({
        asset: balance.a,
        free: balance.f,
        locked: balance.l,
    }));
};

/**
 * Show balance and subscribe on balance update
 */
 const balanceWatcher = async () => {
    const logger = createLogger('Balance');

    const renewlistenKeyInterval = 60 * 60 * 1000; // 1 hour

    const apiClient = new BinanceApiClient({
        apiKey,
        apiSecret,
        baseUrl: 'https://testnet.binance.vision',
        logger,
    });
    
    const wsClient = new BinanceWebSocketClient({
        wsUrl: 'wss://testnet.binance.vision',
        logger,
    });

    const accountData = await apiClient.getAccountData();
    const balance = new Balance(accountData.balances);  
    logger.info(balance.getBalances());  

    const balanceChangeHanlder = (data) => {
        balance.loadBalances(convertEventToAccountBalance(data.B));
        logger.info(balance.getBalances());
    };
    
    const subscribe = async () => {
        logger.info('Renew listenKey');

        const listenKey = await apiClient.issueListenKey();

        return wsClient.subscribeOnAccountChange(
            listenKey,
            balanceChangeHanlder
        )
    };

    let wsRef = subscribe();

    setInterval(async () => {
        wsRef.unsubscribe();
        wsRef = subscribe();
    }, renewlistenKeyInterval);
};

module.exports = balanceWatcher;
