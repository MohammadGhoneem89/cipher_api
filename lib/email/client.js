'use strict';

const sendEmail = require('../../core/api/connectors/email');
const config = require('../../config');

module.exports = send;

function send(params) {
  return new Promise((resolve, reject) => {
    params = params || {};
    params.from = config.get('email.address');
    if (!config.get('email.enabled')) {
      return resolve(true);
    }

    sendEmail(params, function(err, reply) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(reply);
    });

  });
}
