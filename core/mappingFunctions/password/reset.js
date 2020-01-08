'use strict';

const user = require('../../../lib/services/user');
const msgConst = require('../../../lib/constants/msg');

function reset(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  _reset(payload, callback);
}

function _reset(payload, callback) {
  user.resetPassword(payload, msgConst.reset)
    .then(() => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'Please check your email for reset link',
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
              errorDescription: 'Invalid User ID or Email',
              displayToUser: true
            },
            error: error
          }
        }
      };
      callback(response);
    });
}

exports.reset = reset;

