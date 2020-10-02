'use strict';

const user = require('../../../lib/services/user');
const dates = require('../../../lib/helpers/dates');

function userUpdate(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  payload.updatedBy = JWToken._id;
  payload.updatedAt = dates.now;
  _userUpdate(payload, callback);
}

function _userUpdate(payload, callback) {
  user.update(payload).then((user) => {
    const response = {
      responseMessage: {
        action: payload.action,
        data: {
          message: {
            status: 'OK',
            errorDescription: 'User updated successfully',
            displayToUser: true,
            newPageURL: '/userList'
          }
        }
      }
    };
    if (!user) {
      response.responseMessage.data.message = {
        status: 'ERROR',
        errorDescription: 'User not found',
        displayToUser: true
      };
    }
    callback(response);
  })
    .catch((err) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'ERROR',
              errorDescription: err.password || 'User not updated',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}




function userApproveReject(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  payload.updatedBy = JWToken._id;
  payload.updatedAt = dates.now;
  _userApproveReject(payload, callback);
}

function _userApproveReject(payload, callback) {
  if (payload.data.actionTypeACL == "APPROVE") {
    user.approve(payload).then((user) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'User approved successfully',
              displayToUser: true,
              newPageURL: '/userList'
            }
          }
        }
      };
      if (!user) {
        response.responseMessage.data.message = {
          status: 'ERROR',
          errorDescription: 'User not found',
          displayToUser: true
        };
      }
      callback(response);
    }).catch((err) => {
      console.log(err);
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'ERROR',
              errorDescription: err.password || 'User not approved',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
  } else {
    user.reject(payload).then((user) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'User rejected successfully',
              displayToUser: true,
              newPageURL: '/userList'
            }
          }
        }
      };
      if (!user) {
        response.responseMessage.data.message = {
          status: 'ERROR',
          errorDescription: 'User not found',
          displayToUser: true
        };
      }
      callback(response);
    }).catch((err) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'ERROR',
              errorDescription: err.password || 'User not rejected',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
  }
}

exports.userUpdate = userUpdate;
exports.userApproveReject = userApproveReject;
