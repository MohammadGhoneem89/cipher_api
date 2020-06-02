'use strict';

const sha256 = require('sha256');

function encrypt(string = '') {
  return sha256(string);
}

module.exports = encrypt;
