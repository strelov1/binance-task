const BinanceApiClient = require('./api');
const BinanceWebSocketClient = require('./websocket');
const Balance = require('./balance');
const createLogger = require('./logger');
const { convertEventAccountBalance } = require('./utils');
const { apiKey, apiSecret } = require('./secrets');

/**
 * Show balance and subscribe on balance update
 */
const showBalance = async () => {
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
        balance.loadBalances(convertEventAccountBalance(data.B));
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

/**
 * Create order for show balance change
 */
const createOrder = async () => {
    const logger = createLogger('Order');

    const apiClient = new BinanceApiClient({
        apiKey,
        apiSecret,
        baseUrl: 'https://testnet.binance.vision',
        logger,
    });

    try {
        const response = await apiClient.newOrder('BNBUSDT', 'BUY', 'MARKET', {
            quantity: 1,
        });
        logger.info(response.data);
    } catch(e) {
        logger.error(e);
    }

}

module.exports = {
    showBalance,
    createOrder
};