const balanceWatcher = require('./balance');
const highestVolumeTradesWatcher = require('./trades');
const createOrder = require('./order');

module.exports = {
    balanceWatcher,
    highestVolumeTradesWatcher,
    createOrder,
};