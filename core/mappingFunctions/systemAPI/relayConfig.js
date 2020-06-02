'use strict';
const relayNetwork = require('../../../lib/repositories/relayNetwork');
const orgTypeData = require('../org/orgTypeData');
const _ = require('lodash');

function getRelayNetworkConfig(payload, UUIDKey, route, callback, JWToken) {
  relayNetwork.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/editRelayNetwork/"
        ]
      }];
    data[0].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });
    let response = {
      "RelayNetworkList": {
        "action": "RelayNetworkList",
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
      "RelayNetworkList": {
        "action": "RelayNetworkList",
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

function getRelayNetworkConfigByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    relayNetwork.findById(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateRelayNetwork": {
        "action": "AddUpdateRelayNetwork",
        "data": {
          "RelayNetworkConfig": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}

function updateRelayNetworkConfig(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  let resp = {
    "responseMessage": {
      "action": "updateRelayNetworkConfig",
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

  relayNetwork.update(payload).then((data) => {
    resp.responseMessage.data.message.status = "OK";
    resp.responseMessage.data.message.errorDescription = "Record Updated Success!!";
    resp.responseMessage.data.message.newPageURL = "/RelayNetworkList";
    callback(resp);
  });
}

function getServiceList(payload, UUIDKey, route, callback, JWToken) {
  orgTypeData((data) => {
    let resp = {
      "RelayNetworkTypeData": {
        "action": "RelayNetworkTypeData",
        "data": {
          RelayNetworks: [],
          orgList: data || []
        }
      }
    };
    Promise.all([
      relayNetwork.getList(payload)
    ]).then((data) => {
      data[0].forEach((key) => {
        let obj = {
          "label": key.networkName,
          "value": key._id
        };
        resp.RelayNetworkTypeData.data.RelayNetworks.push(obj);
      });
      callback(resp);
    }).catch((err) => {
      callback(err);
    });
  });
}

function getRelayNetworkConfigList(payload, UUIDKey, route, callback, JWToken) {

  relayNetwork.find({})
    .then((arrayList) => {
      let result = {};
      arrayList.forEach((data) => {
        let response = {};
        data.orgList.forEach((dataPeerList, index) => {
          _.set(response, `${dataPeerList.isServer}.${dataPeerList.orgCode}.peer${index + 1}`, dataPeerList);
        });
        _.set(result, `${data.networkName}`, response);
      });
      callback(result);
    })
    .catch((err) => {
      console.log(err);
    });
}

exports.updateRelayNetworkConfig = updateRelayNetworkConfig;
exports.getRelayNetworkConfig = getRelayNetworkConfig;
exports.getRelayNetworkConfigByID = getRelayNetworkConfigByID;
exports.getServiceList = getServiceList;
exports.getRelayNetworkConfigList = getRelayNetworkConfigList;
