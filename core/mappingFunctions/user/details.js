'use strict';

const user = require('../../../lib/services/user');

function get(payload, UUIDKey, route, callback, JWToken) {
  payload.userID = JWToken._id;
  if (JWToken.userID != 'admin' && JWToken.userID != 'Admin')
	payload.orgCode = JWToken.orgCode;
  getDetails(payload, callback);
}

function getDetails(payload, callback) {
  user.getDetails(payload)
    .then((user) => {
      const response = {};
      response[payload.action] = {
        action: payload.action,
        data: user
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.get = get;

