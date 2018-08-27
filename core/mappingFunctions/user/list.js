'use strict';

const user = require('../../../lib/services/user');

function userListOut(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  userList(payload, callback);
}

function userList(payload, callback) {
  user.getList(payload)
    .then((usersDetails) => {
      const response = {
        userList: {
          action: payload.action,
          pageData: {
            pageSize: payload.page.pageSize,
            currentPageNo: payload.page.currentPageNo,
            totalRecords: usersDetails.count
          },
          data: {
            searchResult: usersDetails.users,
            actions: usersDetails.actions
          }
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.userListOut = userListOut;

