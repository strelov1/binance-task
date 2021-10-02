class Monitor {
    constructor () {
        this.latencies = []
        this.lastEventTime = 0;
    }

    /**
     * Register event times
     * @param {number} eventTime timestamp
     * @returns 
     */
    register(eventTime) {
        if (this.lastEventTime === 0) {
            this.lastEventTime = eventTime;
            return;
        }
        const latency = Math.abs(eventTime - this.lastEventTime);
        this.latencies.push(latency);
        this.lastTime = eventTime;
    }

    /**
     * Clear stats
     */
    clear() {
        this.latencies = []
        this.lastEventTime = 0;
    }

    getStats() {
        const { latencies } = this;
        const count = latencies.length;

        if (!count) {
            throw new Error('No stats');
        }

        const min = Math.min(...latencies);
        const max = Math.max(...latencies);
        const sum = latencies.reduce((acc, curr) => acc + curr);

        this.clear();

        return { 
            min: Math.round(min),
            max: Math.round(max),
            mean: Math.round(sum / count)
        };
    }
}

module.exports = Monitor