'use strict';

const logger = require('../helpers/logger')().request;

module.exports = (req, res, next) => {
  // log request
  let request = {
    url: req.originalUrl,
    route: req.route,
    headers: req.headers,
    body: req.body,
    query: req.query
  };
  request = JSON.stringify(request, null, 2);
  logger.info({ fs: 'middleware/requestLog.js', func: 'requestLog' }, `request-${req.originalUrl} request JSON ${request}`);
  next();
};
