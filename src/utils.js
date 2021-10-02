
const buildQuery = (params = {}) => {
    if (!Object.keys(params).length) {
        return '';
    }
    return Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
};

const convertEventAccountBalance = (data) => {
    return data.map(balance => ({
        asset: balance.a,
        free: balance.f,
        locked: balance.l,
    }));
}

module.exports = {
    buildQuery,
    convertEventAccountBalance
};