'use strict';

const group = require('../../../lib/services/group');

function list(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  groupList(payload, callback);
}

function groupList(payload, callback) {
  group.list(payload)
    .then((res) => {
      const response = {
        groupList: {
          action: payload.action,
          pageData: {
            currentPageNo: payload.page.currentPageNo,
            pageSize: payload.page.pageSize,
            totalRecords: res.count
          },
          data: {
            searchResult: res.searchResult,
            actions: res.actions
          }
        }
      };
      callback(response);
    })
    .catch((err) => {
      const response = {
        groupList: {
          action: payload.action,
          data: err
        }
      };
      callback(response);
    });
}

exports.list = list;

