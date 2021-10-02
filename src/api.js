const crypto = require('crypto');
const { default: axios } = require("axios");
const { buildQuery } = require('./utils');

class BinanceApi {
    constructor(options = {}) {
        this.apiKey = options.apiKey;
        this.apiSecret = options.apiSecret;
        this.baseUrl = options.baseUrl || 'https://api.binance.com';
        this.logger = options.logger || console;

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': this.apiKey,
            }
        });
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

    getAccountData() {
        return this.sendPrivateRequest('GET', `/api/v3/account`)
            .then(reponse => reponse.data);
    }

    issueListenKey() {
        return this.sendPublicRequest('POST', `/api/v3/userDataStream`)
            .then(reponse => reponse.data.listenKey);
    }

    getTicker24hr(options = {}) {
        return this.sendPublicRequest(
            'GET',
            '/api/v3/ticker/24hr',
             options
          );
    }

    newOrder(symbol, side, type, options = {}) {
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
