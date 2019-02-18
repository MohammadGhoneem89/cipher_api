'use strict';

const user = require('../../../lib/services/user');

function change(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  _change(payload, callback);
}

function _change(payload, callback) {
  user.updatePassword(payload)
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
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'ERROR',
              errorDescription: err.desc || 'User password not updated',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

exports.change = change;

