'use strict';

const redis = require('redis');
const config = require('../../config');
const logger = require('./logger');

let _redis;

module.exports = (() => {
  _redis = _redis ? _redis : _createClient();

  _redis.on('error', function(err) {
    logger.app.error(err, 'Redis Connection Error');
  });
  _redis.on('warning', function(err) {
    logger.app.error(err, 'Redis Connection Warning');
  });

  return _redis;

  function _createClient() {
    return redis.createClient(config.get('redis'));
  }
})();
