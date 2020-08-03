'use strict';

const notifications = require('../../../lib/services/notifications');
const pNs = require('../../api/pushNotifications');
function insert(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  _insert(payload, callback);
}

function _insert(payload, callback) {
  notifications.create(payload)
    .then(() => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'Notification inserted successfully',
              displayToUser: true,
              newPageURL: '/notificationList'
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
              errorDescription: 'Notification not inserted',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}
function pushByGroupName(payload, UUIDKey, route, callback, JWToken) {
  pNs.pushByGroupName(payload.group, payload.handler || 'stub', payload.text , payload.severity , payload.emailTemplate,  payload.data,  payload.sendEmail);
  callback({})
}

exports.insert = insert;
exports.pushByGroupName = pushByGroupName;

