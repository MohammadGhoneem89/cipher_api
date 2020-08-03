'use strict';

const auditLog = require('../../../lib/services/auditLog');

function detail(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  _detail(payload, callback);
}

function _detail(payload, callback) {
  auditLog.detail(payload)
    .then((detail) => {
      const response = {
        auditLogDetail: {
          action: payload.action,
          data: detail
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.detail = detail;

