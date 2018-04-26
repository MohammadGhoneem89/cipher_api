'use strict';

const group = require('../../lib/services/group');

function detail(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  groupDetail(payload, callback);
}

function groupDetail(payload, callback) {
  group.details(payload)
    .then((res) => {
      const response = {
        groupDetail: {
          action: payload.action,
          data: res
        }
      };
      callback(response);
    })
    .catch((err) => {
      const response = {
        groupDetail: {
          action: payload.action,
          data: err
        }
      };
      callback(response);
    });
}

exports.detail = detail;

