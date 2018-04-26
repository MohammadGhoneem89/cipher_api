'use strict';

const group = require('../../lib/services/group');
const dates = require('../../lib/helpers/dates');

function update(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  payload.updatedBy = JWToken._id;
  payload.updatedAt = dates.now;
  groupUpdate(payload, callback);
}

function groupUpdate(payload, callback) {
  group.update(payload)
    .then((group) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'Group updated successfully',
              displayToUser: true,
              newPageURL: '/groupList'
            }
          }
        }
      };
      if (!group) {
        response.responseMessage.data.message = {
          status: 'ERROR',
          errorDescription: 'Group not found',
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
              errorDescription: 'Group not updated',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

exports.update = update;

