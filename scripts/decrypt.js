'use strict';

const crypto = require('crypto');
const _ = require('lodash');

function decrypt() {
  const str = _.get(process, 'argv[2]', 'b47d75b7979e2903607a85');
  const decryptStr = _decrypt(str);
  console.log({ decrypt: decryptStr }); //eslint-disable-line
}

function _decrypt(str) {
  console.log(str, 'STR');
  const decipher = crypto.createDecipher('aes-256-ctr', 'abcdefg1234567890!@#$%^&*()');
  console.log("decipher ?????? ", decipher)
  const crypt = decipher.update(str, 'hex', 'utf8');
  try {
    return JSON.parse(crypt);
  }
  catch (err) {
    console.log(err.stack)
    return crypt;
  }
}
decrypt();

module.exports = {
  _decrypt
};
