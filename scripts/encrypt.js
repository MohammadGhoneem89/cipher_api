'use strict';

const crypto = require('../lib/helpers/crypto');
const logger = require('../api/bootstrap/logger');
const _ = require('lodash');

function decrypt() {
  const str = _.get(process, 'argv[2]', 'hello world');
  const encryptStr = crypto.encrypt(str);
  logger.app.info({ encrypt: encryptStr }, 'encrypted string');
  console.log({ encrypt: encryptStr }); //eslint-disable-line
}

decrypt();
