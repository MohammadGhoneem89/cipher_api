'use strict';

const crypto = require('../lib/helpers/crypto');
const logger = require('../api/bootstrap/logger');
const _ = require('lodash');

function decrypt() {
  const str = _.get(process, 'argv[2]', 'b47d75b7979e2903607a85');
  const decryptStr = crypto.decrypt(str);
  logger.app.info({ decrypt: decryptStr }, 'encrypted string');
  console.log({ decrypt: decryptStr }); //eslint-disable-line
}

decrypt();
