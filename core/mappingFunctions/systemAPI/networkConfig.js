'use strict';
const networkConfig = require('../../../lib/repositories/networkConfig');
const _ = require('lodash');
function getNetworkConfig(payload, UUIDKey, route, callback, JWToken) {
  networkConfig.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/editNetwork/"
        ]
      }];
    data[0].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "NetworkList": {
        "action": "NetworkList",
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
      "NetworkList": {
        "action": "NetworkList",
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
function getNetworkConfigByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    networkConfig.findById(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateNetwork": {
        "action": "AddUpdateNetwork",
        "data": {
          "NetworkConfig": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}
function updateNetworkConfig(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;

  let resp = {
    "responseMessage": {
      "action": "updateNetworkConfig",
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

  if (true) {
    networkConfig.update(payload).then((data) => {
      resp.responseMessage.data.message.status = "OK";
      resp.responseMessage.data.message.errorDescription = "Record Updated Success!!";
      resp.responseMessage.data.message.newPageURL = "/NetworkList";
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
exports.updateNetworkConfig = updateNetworkConfig;
exports.getNetworkConfig = getNetworkConfig;
exports.getNetworkConfigByID = getNetworkConfigByID;

