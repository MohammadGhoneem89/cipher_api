'use strict';

const user = require('../../../lib/services/user');
const msgConst = require('../../../lib/constants/msg');

function reset(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  _reset(payload, callback);
}

function _reset(payload, callback) {
  console.log("Called RESET!!!!")
  user.resetPassword(payload, msgConst.reset,'ResetPassword')
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
              errorDescription: err.message,
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

