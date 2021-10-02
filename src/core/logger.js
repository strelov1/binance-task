
module.exports = (namespace) => ({
    info: (message) => {
        console.log(`${namespace}:`, message);
    },
    error: (message) => {
        console.error(`${namespace}:`, message);
    },
    trace: (message) => {
        console.trace(`${namespace}:`, message);
    }
});