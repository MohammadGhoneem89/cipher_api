'use strict';
const MappingConfig = require('../../../lib/repositories/mappingConfig');
let customFunctions = require('../../Common/customFunctions.js');
let validationFunctions = require('../../Common/validationFunctions.js');
function getMappingConfig(payload, UUIDKey, route, callback, JWToken) {
  MappingConfig.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/editMapping/"
        ]
      }];

    data[0].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "MappingList": {
        "action": "MappingList",
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
      "MappingConfigList": {
        "action": "MappingConfigList",
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

function getMappingConfigByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    MappingConfig.findById(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateMapping": {
        "action": "AddUpdateMapping",
        "data": {
          "MappingConfig": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}

function upsertMappingConfig(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;

  let resp = {
    "responseMessage": {
      "action": "upsertMappingConfig",
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

  if (payload.mappingName) {

    MappingConfig.findById(payload).then((data) => {
      if (payload.operation === "insert" && data && data.length !== 0) {
        resp.responseMessage.data.message.status = "ERROR";
        resp.responseMessage.data.message.errorDescription = "mappingName already exist!";
        return callback(resp);
      }
      MappingConfig.update({ mappingName: payload.mappingName }, payload).then((data) => {

        resp.responseMessage.data.message.status = "OK";
        console.log(data);

        data.nModified > 0 ?
          resp.responseMessage.data.message.errorDescription = "Record Updated Success!!" :
          resp.responseMessage.data.message.errorDescription = "Record Inserted Successfully!!";

        resp.responseMessage.data.message.newPageURL = "/mappingList";
        callback(resp);
      }).catch((err) => {
        console.log(err);
        return callback(resp);
      });
    });
  }
  else {
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = "mappingName is required!";
    resp.responseMessage.data.message.newPageURL = "";
    return callback(resp);
  }
}

function getServiceList(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    "MappingConfigData": {
      "action": "MappingConfigData",
      "data": {
        REQUEST: [],
        RESPONSE: []
      }
    }
  };
  Promise.all([
    MappingConfig.getServiceList("REQUEST"),
    MappingConfig.getServiceList("RESPONSE")
  ]).then((data) => {
    data[0].forEach((key) => {
      let obj = {
        "label": key.mappingName,
        "value": key._id
      };
      resp.MappingConfigData.data.REQUEST.push(obj);
    });

    data[1].forEach((key) => {
      let obj = {
        "label": key.mappingName,
        "value": key._id
      };
      resp.MappingConfigData.data.RESPONSE.push(obj);
    });
    callback(resp);
  }).catch((err) => {
    callback(err);
  });
}

function getListFunction(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    "FunctionData": {
      "action": "FunctionData",
      "data": {
        custom: [],
        validation: []
      }
    }
  };

  for (let key in validationFunctions) {
    let obj = {
      "label": key,
      "value": key
    };
    resp.FunctionData.data.validation.push(obj);
  };

  for (let key in customFunctions) {
    let obj = {
      "label": key,
      "value": key
    };
    resp.FunctionData.data.custom.push(obj);
  };
  callback(resp);

}

exports.getMappingConfig = getMappingConfig;
exports.getMappingConfigByID = getMappingConfigByID;
exports.upsertMappingConfig = upsertMappingConfig;
exports.getServiceList = getServiceList;
exports.getListFunction = getListFunction;
