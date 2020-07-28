'use strict';

const crypto = require('crypto');
const _ = require('lodash');

function decrypt() {
  const str = _.get(process, 'argv[2]', 'b47d75b7979e2903607a85');
  const decryptStr = _decrypt(str);
  console.log({ decrypt: decryptStr }); //eslint-disable-line
}

function _decrypt(str) {
  const decipher = crypto.createDecipher('aes-256-ctr', 'abcdefg1234567890!@#$%^&*()');
  const crypt = decipher.update(str, 'hex', 'utf8');
  try {
    return JSON.parse(crypt);
  }
  catch (err) {
    return crypt;
  }
}
decrypt();
