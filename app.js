'use strict';

const dbConfig = require('./dbConfig');

global.config = {};

const config = require('./config');
const crypto = require('./lib/helpers/crypto');
const dbURL = crypto.decrypt(config.get('mongodb.url'));
console.log(dbURL, "YAHOOOOOOO");


tryConnection();

function tryConnection() {
  getConfigs()
    .then((config) => {
      global.config = config;
      require('./server');
      console.log({ fs: 'app.js', func: 'init' }, 'server started');
      return Promise.resolve(config);
    })
    .catch((err) => {
      console.log({ fs: 'app.js', func: 'init', error: err.stack || err }, 'server not started, will retry after one minute');
      setTimeout(function() {
        return tryConnection();
      }, 60000);
    });
}

function getConfigs() {
  return new Promise((resolve, reject) => {
    dbConfig.get((err, response, body) => {
      if (!err && typeof body === 'object') {
        resolve(body);
      }
      err = err || body;
      reject(err);
    });
  });
}
