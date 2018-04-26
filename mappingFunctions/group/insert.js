'use strict';

const group = require('../../lib/services/group');

function insert(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  payload.createdBy = JWToken._id;
  groupInsert(payload, callback);
}

function groupInsert(payload, callback) {
  group.insert(payload)
    .then(() => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'Group inserted successfully',
              displayToUser: true,
              newPageURL: '/groupList'
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
              errorDescription: 'Group not inserted',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

exports.insert = insert;

