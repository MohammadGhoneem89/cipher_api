'use strict';

const auditLog = require('../../../lib/services/auditLog');

function list(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  _list(payload, callback);
}

function _list(payload, callback) {
  auditLog.getList(payload)
    .then((list) => {
      const response = {
        auditLogList: {
          action: payload.action,
          pageData: {
            pageSize: payload.page.pageSize,
            currentPageNo: payload.page.currentPageNo,
            totalRecords: list[1]
          },
          data: {
            searchResult: list[0]
          }
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.list = list;

