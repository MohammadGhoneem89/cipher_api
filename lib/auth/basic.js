'use strict';

module.exports = auth;

function auth(username, password) {
  return 'Basic ' + new Buffer(username + ':' + password).toString('base64');
}
