'use strict';

const crypto = require('crypto');
const _ = require('lodash');

function encrypt() {
  const str = _.get(process, 'argv[2]', 'abcdefg1234567890!@#$%^&*()');
  const encryptStr = _encrypt(str);
  console.log({ encrypt: encryptStr }); //eslint-disable-line
}

function _encrypt(crypt = ''){
  crypt = _.isObject(crypt) ? JSON.stringify(crypt) : crypt;
  const cipher = crypto.createCipher('aes-256-ctr', 'abcdefg1234567890!@#$%^&*()');
  return cipher.update(crypt, 'utf8', 'hex');
}

encrypt();
