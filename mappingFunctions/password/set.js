'use strict';

const user = require('../../lib/services/user');

function password(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  _set(payload, callback);
}

function _set(payload, callback) {
  user.setPassword(payload)
    .then(() => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'User password updated successfully',
              displayToUser: true
            }
          }
        }
      };
      callback(response);
    })
    .catch((err) => {
      const error = err.stack || err;
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'ERROR',
              errorDescription: err.desc || 'User password not updated',
              displayToUser: true
            },
            error: error
          }
        }
      };
      callback(response);
    });
}

exports.password = password;

