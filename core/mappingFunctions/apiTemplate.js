'use strict';

const apiTemplate = require('../../lib/repositories/apiTemplate');

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
  apiTemplate.upsert(payload)
    .then((user) => {
      const response = {
        responseMessage: {
          action: payload.action,
          data: {
            message: {
              status: 'OK',
              errorDescription: 'API Template updated successfully',
              displayToUser: true,
              newPageURL: '/endpoint'
            }
          }
        }
      };
      if (!user) {
        response.responseMessage.data.message = {
          status: 'ERROR',
          errorDescription: 'API Template not found',
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
              errorDescription: 'API Template not updated',
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
  apiTemplate.findOne(payload)
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
  apiTemplate.findPageAndCount(payload)
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

