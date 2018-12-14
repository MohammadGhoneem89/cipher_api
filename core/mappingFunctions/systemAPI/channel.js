'use strict';
const channel = require('../../../lib/repositories/channel');
const _ = require('lodash');
function getChannelConfig(payload, UUIDKey, route, callback, JWToken) {
  channel.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/CreateChannel/"
        ]
      }];
    data[0].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "ChannelList": {
        "action": "ChannelList",
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
      "ChannelList": {
        "action": "ChannelList",
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
function getChannelConfigByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    channel.findById(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateChannel": {
        "action": "AddUpdateChannel",
        "data": {
          "ChannelConfig": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    console.log(err);
    let response = {
      "AddUpdateChannel": {
        "action": "AddUpdateChannel",
        "data": {
          "ChannelConfig": {}
        }
      }
    };
    callback(response);
  });
}
function updateChannelConfig(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;

  let resp = {
    "responseMessage": {
      "action": "updateChannelConfig",
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
    channel.update(payload).then((data) => {
      resp.responseMessage.data.message.status = "OK";
      resp.responseMessage.data.message.errorDescription = "Record Updated Success!!";
      resp.responseMessage.data.message.newPageURL = "/ChannelList";
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

function getServiceList(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    "ChannelTypeData": {
      "action": "ChannelTypeData",
      "data": {
        channels: []
      }
    }
  };
  Promise.all([
    channel.getList(payload)
  ]).then((data) => {
    data[0].forEach((key) => {
      let obj = {
        "label": `${key.channelName}-${key.networkName}`,
        "value": key._id
      };
      resp.ChannelTypeData.data.channels.push(obj);
    });
    callback(resp);
  }).catch((err) => {
    callback(err);
  });
}

exports.updateChannelConfig = updateChannelConfig;
exports.getChannelConfig = getChannelConfig;
exports.getChannelConfigByID = getChannelConfigByID;
exports.getServiceList = getServiceList;
