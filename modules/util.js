const clog = console.log;
function logClientIP(req, res, next) {
    clog(`${Math.ceil(Math.random() * 100) + 100} req.ip ${req.connection.remoteAddress}`);
    next();
}

module.exports = { clog, logClientIP };