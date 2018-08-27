'use strict';

const redis = require('../../core/api/connectors/redis');

module.exports = del;

function del(key) {
  return new Promise(function(resolve, reject) {
    redis.del(key, function(err, results) {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
}
