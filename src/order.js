const BinanceApiClient = require('./core/api');
const createLogger = require('./core/logger');
const { apiKey, apiSecret } = require('./secrets');

/**
 * Create order for demonstrate balance change
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
        const response = await apiClient.createNewOrder('BNBUSDT', 'BUY', 'MARKET', {
            quantity: 1,
        });
        logger.info(response.data);
    } catch(e) {
        logger.error(e);
    }
};

module.exports = createOrder;
