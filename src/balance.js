class Balance {
    constructor(initBalances) {
        this.balances = {};
        this.loadBalances(initBalances);
    }

    loadBalances(newBlances = []) {
        for (const balance of Object.values(newBlances)) {
            const sum = parseFloat(balance.free) - parseFloat(balance.locked);
            if (sum > 0) {
                this.balances[balance.asset] = sum;
            }
        }
    }

    getBalances() {
        return JSON.stringify(this.balances);
    }
}

module.exports = Balance