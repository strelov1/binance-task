const WebSocketClient = require('ws');

class AutoReconnectWebSocket {
    constructor(url, hanlder, options = {}) {
        this.logger = options.logger || console;
        this.autoReconnect = options.autoReconnect === undefined ? true : options.autoReconnect;
        this.autoReconnectDelay = this.autoReconnectDelay | 1000;
        this.unsubscribed = false;
        this.subscribe(url, hanlder);
    }

    subscribe(url, hanlder) {
        this.ws = new WebSocketClient(url);
        this.ws.on('open', () => {
            this.logger.info('Subscribe on socket');
        });
        
        this.ws.on('message', hanlder);

        this.ws.on('error', err => {
            this.logger.error(err);
        });

        this.ws.on('close', (code) => {
            this.logger.info(`Socket connection close: ${code}`);
            if (this.autoReconnect && !this.unsubscribed) {
                setTimeout(() => {
                    this.logger.error(`Reconnection...`);
                    this.subscribe(url, hanlder);
                }, this.autoReconnectDelay);
            }
        });
    }

    unsubscribe() {
        this.unsubscribed = true;
        this.ws.close();
    }
}
class BinanceWebSocketClient {
    constructor(options = {}) {
        this.wsUrl = options.wsUrl || `wss://stream.binance.com:9443`;
        this.logger = options.logger || console;
        this.autoReconnect = options.autoReconnect ;
        this.autoReconnectDelay = options.autoReconnectDelay;
    }

    subscribe(url, hanlder) {
        const ws = new AutoReconnectWebSocket(url, hanlder, {
            logger: this.logger,
            autoReconnect: this.autoReconnect,
            autoReconnectDelay: this.autoReconnectDelay,
        });
        return { 
            unsubscribe: () => ws.unsubscribe()
        };
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

    trade(symbol, hanlder) {
        const url = `${this.wsUrl}/ws/${symbol.toLowerCase()}@trade`
        return this.subscribe(url, hanlder);
    }
}

module.exports = BinanceWebSocketClient;
