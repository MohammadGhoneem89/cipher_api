'use strict';

const dbConfig = require('./dbConfig');

global.config = {};


const config = require('./config');
const crypto = require('./lib/helpers/crypto');
const dbURL = crypto.decrypt("b17777bc97da3c563d398d5fdefb7c010a4d6c45f57ec93353390f72ac44bb6fe4aa");
console.log(dbURL, config.get('mongodb.url'), "NOOOOOOOOOOOOOOO");


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
