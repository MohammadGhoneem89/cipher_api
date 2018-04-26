'use strict';

const client = require('./client');
const config = require('../../config');

module.exports = sendMany;

function sendMany(emails) {
  const promises = [];
  for (let email of emails) {
    email = email || {};
    email.from = config.get('emailAddress');
    promises.push(client(email));
  }
  return Promise.all(promises);
}
