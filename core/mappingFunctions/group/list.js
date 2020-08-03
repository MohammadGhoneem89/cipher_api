'use strict';

const group = require('../../../lib/services/group');
const _ = require('lodash');

function list(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  groupList(payload, callback);
}

function groupTypeList(payload, UUIDKey, route, callback, JWToken) {
  group.find({})
    .then((data) => {
      let groupMap = {}
      data.forEach((elem) => {
        let glist = _.get(groupMap, elem.type, []);
        glist.push({
          "label": elem.name,
          "value": elem._id
        });
        _.set(groupMap, elem.type, glist);
      });
      const response = {
        groupTypeList: {
          action: payload.action,
          data: groupMap
        }
      };
      callback(response);
    })
    .catch((err) => {
      const response = {
        groupTypeList: {
          action: payload.action,
          data: err
        }
      };
      callback(response);
    });
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
exports.groupTypeList = groupTypeList;

