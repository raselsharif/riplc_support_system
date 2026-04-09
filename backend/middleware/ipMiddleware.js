const { getClientIp } = require("../utils/ipHelper");

const ipMiddleware = (req, _res, next) => {
  req.clientIP = getClientIp(req);
  next();
};

module.exports = ipMiddleware;
