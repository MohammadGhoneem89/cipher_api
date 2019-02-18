'use strict';

const user = require('../../../lib/services/user');

function userCreate(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  create(payload, callback);
}

function create(payload, callback) {
  user.create(payload)
    .then(() => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'User inserted successfully',
              displayToUser: true,
              newPageURL: '/userList'
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
              errorDescription: 'User not inserted',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

exports.userCreate = userCreate;

