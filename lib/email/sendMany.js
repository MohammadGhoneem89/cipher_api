'use strict';

const client = require('./client');

module.exports = sendMany;

function sendMany(emails) {
  const promises = [];
  for (let email of emails) {
    email = email || {};
    promises.push(client(email));
  }
  return Promise.all(promises);
}
