'use strict';

const redis = require('../../api/bootstrap/redis');

module.exports = get;

function get(key) {
  return new Promise(function(resolve, reject) {
    redis.get(key, function(err, results) {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
}
