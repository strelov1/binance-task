const WebSocketClient = require('ws');

class BinanceWebSocketClient {
    constructor(options = {}) {
        this.wsUrl = options.wsUrl || `wss://stream.binance.com:9443`;
        this.logger = options.logger || console;
    }

    subscribe(url, hanlder) {
        const ws = new WebSocketClient(url);

        ws.on('open', () => {
            this.logger.info('Subscribe on socket');
        });
        
        ws.on('message', hanlder);

        ws.on('error', err => {
            this.logger.error(err);
        });

        ws.on('close', (code) => {
            this.logger.info(`Socket connection close: ${code}`);
        });

        return { unsubscribe: () => ws.close() };
    }

    userData(listenKey, hanlder) {
        const url = `${this.wsUrl}/ws/${listenKey}`
        return this.subscribe(url, hanlder);
    }

    subscribeOnAccountChange(listenKey, hanlder) {
        return this.userData(listenKey, (response) => {
            const data = JSON.parse(response);
            if (data.e && data.e === 'outboundAccountPosition') {
                hanlder(data);
            }
        });
    }

    tradeWS(symbol, hanlder) {
        const url = `${this.wsUrl}/ws/${symbol.toLowerCase()}@trade`
        return this.subscribe(url, hanlder);
    }
}

module.exports = BinanceWebSocketClient;
