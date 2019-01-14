'use strict';

const endpointDefination = require('../../lib/repositories/endpointDefination');

function upsert(payload, UUIDKey, route, callback, JWToken) {
  _upsert(payload, callback);
}

function findOne(payload, UUIDKey, route, callback, JWToken) {
  _findOne(payload, callback);
}

function list(payload, UUIDKey, route, callback, JWToken) {
  _list(payload, callback);
}

function _upsert(payload, callback) {
  endpointDefination.upsert(payload)
    .then((user) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'Endpoint updated successfully',
              displayToUser: true,
              newPageURL: '/userList'
            }
          }
        }
      };
      if (!user) {
        response.responseMessage.data.message = {
          status: 'ERROR',
          errorDescription: 'Endpoint not found',
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
              errorDescription: 'Endpoint not updated',
              displayToUser: true
            },
            error: err
          }
        }
      };
      callback(response);
    });
}

function _findOne(payload, callback) {
  endpointDefination.findOne(payload)
    .then((user) => {
      const response = {};
      response[payload.action] = {
        action: payload.action,
        data: user
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

function _list(payload, callback) {
  endpointDefination.findPageAndCount(payload)
    .then((res) => {
      const response = {
        [payload.action]: {
          action: payload.action,
          pageData: {
            pageSize: payload.page.pageSize,
            currentPageNo: payload.page.currentPageNo,
            totalRecords: res[1]
          },
          data: res[0]
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.list = list;
exports.findOne = findOne;
exports.upsert = upsert;

