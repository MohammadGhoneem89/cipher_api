'use strict';
const consortiumConfig = require('../../../lib/repositories/consortiumConfig');
const _ = require('lodash');
const smartcontract = require('../../../lib/repositories/smartcontract');
function getConsortiumConfig(payload, UUIDKey, route, callback, JWToken) {

  consortiumConfig.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "Edit",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/CreateConsortium/"
        ]
      },
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/cipher/consortiumSetup/view/"
        ]
      }];


    data[0].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "ConsortiumList": {
        "action": "ConsortiumList",
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
      "ConsortiumList": {
        "action": "ConsortiumList",
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
function getConsortiumConfigByID(payload, UUIDKey, route, callback, JWToken) {

  Promise.all([
    consortiumConfig.findById(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateConsortium": {
        "action": "AddUpdateConsortium",
        "data": {
          "ConsortiumConfig": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    console.log(err);
    let response = {
      "AddUpdateConsortium": {
        "action": "AddUpdateConsortium",
        "data": {
          "ConsortiumConfig": {}
        }
      }
    };
    callback(response);
  });
}
function getConsortiumConfigByDetailID(payload, UUIDKey, route, callback, JWToken) {

  Promise.all([
    consortiumConfig.findByIdDetail(payload)
  ]).then((data) => {
    let response = {
      "viewConsortium": {
        "action": "ViewConsortium",
        "data": data[0]
      }
    };
    callback(response);
  }).catch((err) => {
    console.log(err);
    let response = {
      "viewConsortium": {
        "action": "ViewConsortium",
        "data": {
        }
      }
    };
    callback(response);
  });
}
function updateConsortiumConfig(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;

  let resp = {
    "responseMessage": {
      "action": "updateConsortiumConfig",
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
    consortiumConfig.update(payload).then((data) => {
      resp.responseMessage.data.message.status = "OK";
      resp.responseMessage.data.message.errorDescription = "Record Updated Success!!";
      resp.responseMessage.data.message.newPageURL = "/cipher/consortiumSearch";
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
  let promises = [];

  //if (payload.type === 'consortium') {
  promises.push(consortiumConfig.getList(payload));
  // } 
  let channelID = payload.channelID;
  let selectedConsortium = payload.selectedConsortium;

  console.log(channelID)
  console.log(selectedConsortium)
  let channelList = [];
  let selectedChannel = "";
  let resp = {
    "ConsortiumTypeData": {
      "action": "ConsortiumTypeData",
      "data": {
        consortium: [],
        channel: [],
        smartcontract: []
      }
    }
  };

  Promise.all(
    promises
  ).then((data) => {
    data[0].forEach((key) => {
      let orgList = [];
      if (selectedConsortium == key._id) {
        channelList = key.selectedChannelList;
      }
      key.participants.forEach((element) => {
        orgList.push(element.organizationName);
      });
      let obj = {
        "label": `${key.ConsortiumName} | ${orgList.join('-')} | Type: ${key.type}`,
        "value": key._id
      };
      resp.ConsortiumTypeData.data.consortium.push(obj);
    });
    if (channelList.length === 0) {
      channelList = data[0][0].selectedChannelList;
    }
    channelList.forEach((element) => {
      if (channelID == element._id) {
        selectedChannel = element._id;
      }
      let obj = {
        "label": `${element.channelName} | Network: ${element.networkName}`,
        "value": element._id
      };
      resp.ConsortiumTypeData.data.channel.push(obj);
    });
    if (selectedChannel === '') {
      selectedChannel = resp.ConsortiumTypeData.data.channel[0].value;
    }
    smartcontract.getListByChannel(selectedChannel).then((data) => {

      data.forEach((element) => {
        let obj = {
          "label": `${element.smartContract}`,
          "value": element._id
        };
        resp.ConsortiumTypeData.data.smartcontract.push(obj);
      });
      callback(resp);
    });



  }).catch((err) => {
    callback(err);
  });
}

exports.updateConsortiumConfig = updateConsortiumConfig;
exports.getConsortiumConfig = getConsortiumConfig;
exports.getConsortiumConfigByID = getConsortiumConfigByID;
exports.getServiceList = getServiceList;
exports.getConsortiumConfigByDetailID = getConsortiumConfigByDetailID;
