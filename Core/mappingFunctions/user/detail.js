'use strict';

const user = require('../../../lib/services/user');

function detail(payload, UUIDKey, route, callback, JWToken) {
  payload.userID = JWToken._id;
  payload.id = JWToken._id;
  _detail(payload, callback);
}

function _detail(payload, callback) {
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

exports.detail = detail;

