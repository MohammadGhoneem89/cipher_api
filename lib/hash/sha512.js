'use strict';

const sha512 = require('sha512');

function encrypt(string = '') {
  return sha512(string).toString('hex');
}

module.exports = encrypt;
