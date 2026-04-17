const _global = typeof window !== 'undefined' ? window : globalThis;
module.exports = _global.fetch.bind(_global);
module.exports.Headers = _global.Headers;
module.exports.Request = _global.Request;
module.exports.Response = _global.Response;
module.exports.default = module.exports;
