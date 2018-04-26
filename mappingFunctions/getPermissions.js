'use strict';

const permission = require('../lib/services/permission');

function getList(payload, UUIDKey, route, callback, JWToken) {
  payload.userID = JWToken._id;
  payload.action = route;
  get(payload, callback);
}

function get(payload, callback) {
  permission.get(payload)
    .then((permissions) => {
      const response = {
        permissionData: {
          action: payload.action,
          data: { menuPermissions: permissions }
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.getList = getList;

