const formatedBalances = (balances) => {
    return Object.entries(balances)
        .map(([asset, amount]) => `${asset}: ${amount}`)
        .join(' | ');
}
class Balance {
    constructor(initBalances, options = {}) {
        this.logger = options.logger || console;
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
        const formatedBalance = formatedBalances(this.getBalances());
        this.logger.info(`Update: ${formatedBalance}`);
    }

    getBalances() {
        return this.balances;
    }
}

module.exports = Balance