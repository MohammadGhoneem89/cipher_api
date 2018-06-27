'use strict';

const redis = require('../../Core/api/bootstrap/redis');

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
