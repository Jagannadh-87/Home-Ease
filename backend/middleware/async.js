exports.h = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
exports.fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
