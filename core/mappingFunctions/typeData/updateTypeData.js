/**
 * Created by abdullah on 4/17/18.
 */
'use strict';

const typeData = require('../../../lib/services/typeData');

function updateTypeData(payload, UUIDKey, route, callback, JWToken) {

  payload.userId = JWToken._id;
  get(payload, callback);
}

function get(payload, callback) {

  typeData.updateTypeData(payload)
    .then((typeData) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'typeData updated successfully',
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
              errorDescription: 'typeData not updated',
              displayToUser: true
            },
            error: err.stack || err
          }
        }
      };
      callback(response);
    });
}

exports.updateTypeData = updateTypeData;

