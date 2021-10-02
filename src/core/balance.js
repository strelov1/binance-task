class Balance {
    constructor(initBalances) {
        this.balances = {};
        this.loadBalances(initBalances);
    }

    loadBalances(newBlances = []) {
        for (const balance of Object.values(newBlances)) {
            const currentSum = parseFloat(balance.free) - parseFloat(balance.locked);
            if (currentSum > 0) {
                this.balances[balance.asset] = currentSum;
            }
        }
    }

    getBalances() {
        return JSON.stringify(this.balances);
    }
}

module.exports = Balance