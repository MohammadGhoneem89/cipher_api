'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;

const crypto = require('crypto');
const _ = require('lodash');


exports.viewItem = function (payload, UUIDKey, route, callback, JWToken) {
  callback("YAHOOOO");
};


function _encrypt(crypt = ''){
  crypt = _.isObject(crypt) ? JSON.stringify(crypt) : crypt;
  const cipher = crypto.createCipher('aes-256-ctr', 'abcdefg1234567890!@#$%^&*()');
  return cipher.update(crypt, 'utf8', 'hex');
}

function _decrypt(str){
   const decipher = crypto.createDecipher('aes-256-ctr', 'abcdefg1234567890!@#$%^&*()');
   const crypt = decipher.update(str, 'hex', 'utf8');
   try {
    return JSON.parse(crypt);
   }
   catch (err) {
    return crypt;
   }
}

exports.encryptData = function (payload, UUIDKey, route, callback, JWToken) {
  const encryptStr = _encrypt(payload.data);
  callback({ encrypt: encryptStr });
};

exports.decryptData = function (payload, UUIDKey, route, callback, JWToken) {
  const decryptStr = _decrypt(payload.data);
  callback({ decrypt: decryptStr });
}

