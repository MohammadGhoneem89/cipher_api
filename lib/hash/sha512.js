'use strict';

const crypto = require('crypto');

function encrypt(string = '') {
  return crypto.createHash('sha512').update(string).digest('hex');
}

module.exports = encrypt;
