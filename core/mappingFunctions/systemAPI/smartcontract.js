'use strict';
const smartcontract = require('../../../lib/repositories/smartcontract');
const _ = require('lodash');
function getSmartContractConfig(payload, UUIDKey, route, callback, JWToken) {
  smartcontract.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/CreateSmartContract/"
        ]
      }];
    data[0].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "SmartContractList": {
        "action": "SmartContractList",
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
      "SmartContractList": {
        "action": "SmartContractList",
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
function getSmartContractConfigDetailedByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    smartcontract.findByIdDetail(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateSmartContract": {
        "action": "AddUpdateSmartContract",
        "data": {
          "SmartContractConfig": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    console.log(err);
    let response = {
      "AddUpdateSmartContract": {
        "action": "AddUpdateSmartContract",
        "data": {
          "SmartContractConfig": {}
        }
      }
    };
    callback(response);
  });
}
function getSmartContractConfigByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    smartcontract.findById(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateSmartContract": {
        "action": "AddUpdateSmartContract",
        "data": {
          "SmartContractConfig": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    console.log(err);
    let response = {
      "AddUpdateSmartContract": {
        "action": "AddUpdateSmartContract",
        "data": {
          "SmartContractConfig": {}
        }
      }
    };
    callback(response);
  });
}
function updateSmartContractConfig(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;

  let resp = {
    "responseMessage": {
      "action": "updateSmartContractConfig",
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
    smartcontract.update(payload).then((data) => {
      resp.responseMessage.data.message.status = "OK";
      resp.responseMessage.data.message.errorDescription = "Record Updated Success!!";
      resp.responseMessage.data.message.newPageURL = "/SmartContractList";
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
    "SmartContractTypeData": {
      "action": "SmartContractTypeData",
      "data": {
        smartcontracts: []
      }
    }
  };
  Promise.all([
    smartcontract.getList()
  ]).then((data) => {
    data[0].forEach((key) => {
      let obj = {
        "label": `Type:  ${key.type.toUpperCase()} | Smart Contract : ${key.smartContract.toUpperCase()} | Version : ${key.smartContractVersion.toUpperCase()} | Channel : ${key.channelName.toUpperCase()}`,
        "value": key._id
      };
      resp.SmartContractTypeData.data.smartcontracts.push(obj);
    });
    callback(resp);
  }).catch((err) => {
    callback(err);
  });
}

exports.updateSmartContractConfig = updateSmartContractConfig;
exports.getSmartContractConfig = getSmartContractConfig;

exports.getSmartContractConfigDetailedByID = getSmartContractConfigDetailedByID;
exports.getSmartContractConfigByID = getSmartContractConfigByID;
exports.getServiceList = getServiceList;
