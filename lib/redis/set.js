'use strict';

const redis = require('../../core/api/connectors/redis');

module.exports = set;

function set(key, value) {
  return new Promise(function(resolve, reject) {
    redis.set(key, value, function(err, results) {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
}
