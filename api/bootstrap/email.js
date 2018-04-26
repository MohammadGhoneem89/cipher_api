'use strict';

const sendmail = require('sendmail');
const logger = require('./logger').app;
const config = require('../../config');

let _email;

module.exports = (() => {
  _email = _email ? _email : _sendEmail();
  return _email;

  function _sendEmail() {
    return sendmail({
      logger: logger,
      silent: false,
      devHost: config.get('email.host'),
      devPort: config.get('email.port')
    });
  }
})();
