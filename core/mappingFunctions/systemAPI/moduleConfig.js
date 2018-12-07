'use strict';
const permission = require('../../../lib/repositories/permission');
const typeData = require('../../../lib/repositories/typeData');
let customFunctions = require('../../Common/customFunctions.js');
let validationFunctions = require('../../Common/_validationFunctions.js');
const groupPermission = require('../../../lib/services/group');
const _ = require('lodash');
function getModuleConfig(payload, UUIDKey, route, callback, JWToken) {
  permission.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/editModule/"
        ]
      }];

    data[0].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "ModuleList": {
        "action": "ModuleList",
        "pageData": {
          "pageSize": payload.page.pageSize,
          "currentPageNo": payload.page.currentPageNo,
          "totalRecords": data[1]
        },
        "data": {
          "searchResult": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    console.log(JSON.stringify(err));
    let response = {
      "ModuleList": {
        "action": "ModuleList",
        "pageData": {
          "pageSize": payload.page.pageSize,
          "currentPageNo": payload.page.currentPageNo,
          "totalRecords": 0
        },
        "data": {
          "searchResult": []
        }
      }
    };
    callback(response);
  });
}
function getModuleConfigByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    permission.findById(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateModule": {
        "action": "AddUpdateModule",
        "data": {
          "ModuleConfig": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}


function updateModuleConfig(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;

  let resp = {
    "responseMessage": {
      "action": "updateModuleConfig",
      "data": {
        "message": {
          "status": "ERROR",
          "errorDescription": "Some Error Occured during operation!!, Please Contact Support",
          "displayToUser": true,
          "newPageURL": ""
        }
      }
    }
  };

  if (payload._id) {
    permission.update({ _id: payload._id }, payload).then((data) => {
      resp.responseMessage.data.message.status = "OK";
      resp.responseMessage.data.message.errorDescription = "Record Updated Success!!";
      resp.responseMessage.data.message.newPageURL = "/moduleList";
      callback(resp);
    });
  }
  else {
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = "id is required!";
    resp.responseMessage.data.message.newPageURL = "";
    return callback(resp);
  }
}
exports.updateModuleConfig = updateModuleConfig;
exports.getModuleConfig = getModuleConfig;
exports.getModuleConfigByID = getModuleConfigByID;

