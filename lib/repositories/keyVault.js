'use strict';

const request = require('request');
const config = require('../../config/config.json');
const _ = require('lodash');
const rp = require('request-promise');
module.exports = {
  getDBList: getDBList,
  getDBConfig: getDBConfig,
  getVaultConfig: getVaultConfig
};

function get(callback) {
  const options = {
    method: 'POST',
    url: config.keyVault.url,
    body: { env: config.coreDB.env, header: config.coreDB.header },
    json: true
  };
  request(options, callback);
}

function getVaultConfig(env) {
  const options = {
    method: 'POST',
    uri: config.keyVault.url,
    body: { env: env, header: config.coreDB.header },
    json: true
  };
  return rp(options);
}

function getDBList() {
  return new Promise((resolve, reject) => {
    get((err, response, body) => {
      if (!err && typeof body === 'object') {
        resolve(body);
      }
      err = err || body;
      reject(err);
    });
  });
}

function getDBConfig(db, value) {
  return new Promise((resolve, reject) => {
    get((err, response, body) => {
      if (!err && typeof body === 'object') {
        let adaptor = _.find(body[db], { value: value });
        resolve(adaptor);
      }
      reject(err);
    });
  });
}