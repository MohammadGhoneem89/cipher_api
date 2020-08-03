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
  const decipher = crypto.createDecipher('aes-256-ctr', '4b32a690-8949-11ea-89db-777c257036644b32a691-8949-11ea-89db-777c257036644b32a692-8949-11ea-89db-777c257036644b32a693-8949-11ea-89db-777c25703664');
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
