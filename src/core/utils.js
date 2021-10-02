
const buildQuery = (params = {}) => {
    if (!Object.keys(params).length) {
        return '';
    }
    return Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
};

module.exports = {
    buildQuery
};