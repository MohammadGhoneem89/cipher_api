'use strict';

const crypto = require('crypto');
const config = require('../../config');
const _ = require('lodash');
const uuid = require('uuid/v1');

module.exports = {
  encrypt,
  decrypt,
  encryptEx,
  decryptEx
};

function encrypt(crypt = '') {
  crypt = _.isObject(crypt) ? JSON.stringify(crypt) : crypt;
  const cipher = crypto.createCipher('aes-256-ctr', config.get('cryptoTemp'));
  return cipher.update(crypt, 'utf8', 'hex');
}

function decrypt(str = '') {

  return decryptEx(str);

  /* const decipher = crypto.createDecipher('aes-256-ctr', config.get('cryptoTemp'));
  const crypt = decipher.update(str, 'hex', 'utf8');
  try {
    return JSON.parse(crypt);
  }
  catch (err) {
    return crypt;
  }*/
}

function encryptEx(crypt = '') {
  const signingKey = uuid() + uuid() + uuid() + uuid();

  // console.log("this is signed key"  + signingKey );
  crypt = _.isObject(crypt) ? JSON.stringify(crypt) : crypt;

  const cipher = crypto.createCipher('aes-256-ctr', signingKey);
  const finalCrypt = {
    key: signingKey,
    value: cipher.update(crypt, 'utf8', 'hex')
  };

  // console.log(JSON.stringify(finalCrypt));

  return encrypt(finalCrypt);

}

function decryptEx(str = '') {

  const decipher = crypto.createDecipher('aes-256-ctr', config.get('cryptoTemp'));
  const crypt = decipher.update(str, 'hex', 'utf8');
  try {
    const finalCrypt = JSON.parse(crypt);
    // console.log(JSON.stringify(finalCrypt));

    const decipher1 = crypto.createDecipher('aes-256-ctr', finalCrypt.key);
    const crypt1 = decipher1.update(finalCrypt.value, 'hex', 'utf8');
    // console.log(crypt1);
    return JSON.parse(crypt1);
  }
  catch (err) {
    // console.log ("this is the error" + err);
    console.log("ERRRRRRRRRRRRRRRRRRRRRRRR", crypt, err);
    return crypt;
  }
}
