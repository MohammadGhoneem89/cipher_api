'use strict';

const dbConfig = require('./dbConfig');

global.config = {};

tryConnection();
const crypto = require('crypto');
const _ = require('lodash');


function encrypt(str, secret) {
  const cipher = crypto.createCipher('aes-256-ctr', secret);
  let crypt = cipher.update(str, 'utf8', 'hex');
  console.log({encrypt: crypt});
}

function decrypt(str, secret) {
  const decipher = crypto.createDecipher('aes-256-ctr', secret);
  let crypt = decipher.update(str, 'hex', 'utf8');
  console.log({decrypt: crypt});
}

function tryConnection() {
  getConfigs()
    .then((config) => {
      global.config = config;

      const arg = _.get(process, 'argv[2]', undefined);
      const strInp = _.get(process, 'argv[3]', undefined);
      if (!arg) {
        require('./server');
        console.log({fs: 'app.js', func: 'init'}, 'server started');
      }
      else {
        console.log(process.argv)
        arg === 'Encrypt' || arg === 'encrypt' || arg === 'e' ? encrypt(strInp, config.cryptoTemp) : null;
        arg === 'Decrypt' || arg === 'decrypt' || arg === 'd' ? decrypt(strInp, config.cryptoTemp) : null;
      }
      return Promise.resolve(config);
    })
    .catch((err) => {
      console.log({
        fs: 'app.js',
        func: 'init',
        error: err.stack || err
      }, 'server not started, will retry after one minute');
      setTimeout(function () {
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
