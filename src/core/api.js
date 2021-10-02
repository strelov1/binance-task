const crypto = require('crypto');
const { default: axios } = require("axios");
const { buildQuery } = require('./utils');

class BinanceApi {
    constructor(options = {}) {
        this.apiKey = options.apiKey;
        this.apiSecret = options.apiSecret;
        this.baseUrl = options.baseUrl || 'https://api.binance.com';
        this.logger = options.logger || console;
        this.debug = options.debug || false;

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': this.apiKey,
            }
        });

        if (this.debug) {
            this.client.interceptors.request.use(
                config => {
                    this.logger.info('Request');
                    this.logger.info(config);
                    return config;
                },
                error => {
                    this.logger.info('Response');
                    this.logger.error(error);
                    Promise.reject(error)
                }
            );
            this.client.interceptors.response.use(
                response => {
                    this.logger.info(response)
                    return response;
                }
            );
        }
    }

    sendPublicRequest(method, path, options = {}) {
        return this.client.request({
            method,
            url: path,
            ...options,
        });
    }

    sendPrivateRequest(method, path, options = {}) {
        const timestamp = Date.now();
        const query = buildQuery({...options, timestamp });

        const signature = crypto
            .createHmac('sha256', this.apiSecret)
            .update(query)
            .digest('hex');

        return this.client.request({
            method,
            url: `${path}?${query}&signature=${signature}`,
            ...options,
        });
    }

    /**
     * https://binance-docs.github.io/apidocs/spot/en/#account-information-user_data
     * 
     * @returns {object} Account data
     */
    getAccountData() {
        return this.sendPrivateRequest('GET', `/api/v3/account`)
            .then(reponse => reponse.data);
    }

    /**
     * https://binance-docs.github.io/apidocs/spot/en/#listen-key-spot
     * 
     * @returns {number} listenKey
     */
    issueListenKey() {
        return this.sendPublicRequest('POST', `/api/v3/userDataStream`)
            .then(reponse => reponse.data.listenKey);
    }

    /**
     * https://binance-docs.github.io/apidocs/spot/en/#24hr-ticker-price-change-statistics
     * 
     * @param {*} options
     * @returns []
     */
    getTicker24hr(options = {}) {
        return this.sendPublicRequest(
            'GET',
            '/api/v3/ticker/24hr',
             options
          );
    }

    /**
     * 
     * @param {*} symbol 
     * @param {*} side 
     * @param {*} type 
     * @param {*} options 
     * @returns 
     */
    createNewOrder(symbol, side, type, options = {}) {
        return this.sendPrivateRequest(
            'POST',
            '/api/v3/order',
            {
                ...options,
                symbol: symbol.toUpperCase(),
                side: side.toUpperCase(),
                type: type.toUpperCase()
            }
        );
    }
}

module.exports = BinanceApi;
