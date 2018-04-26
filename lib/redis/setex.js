'use strict';

const redis = require('../../api/bootstrap/redis');

module.exports = set;

function set(key, expire, value) {
  return new Promise(function(resolve, reject) {
    redis.setex(key, expire, value, function(err, results) {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
}

