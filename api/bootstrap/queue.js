'use strict';

const open = require('amqplib');
const crypto = require('../../lib/helpers/crypto');
const config = require('../../config');

const MQConnStr = crypto.decrypt(config.get('amqp.url'));

function _start() {
  return open.connect(MQConnStr)
    .then((conn) => conn.createChannel())
    .catch((err) => {
      console.log('[AMQP] reconnecting', err); // eslint-disable-line no-console
      return setTimeout(_start, 1000);
    });
}

module.exports = {
  start: _start
};
