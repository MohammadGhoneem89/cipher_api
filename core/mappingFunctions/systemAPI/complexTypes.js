'use strict';
const fs = require('fs');
const ComplexTypes = require('../../../lib/repositories/complexTypes');
const typeData = require('../../../lib/repositories/typeData');
let customFunctions = require('../../Common/customFunctions.js');
let validationFunctions = require('../../Common/_validationFunctions.js');
const groupPermission = require('../../../lib/services/group');
let apiDefination = require('./APIDefination');
const _ = require('lodash');

function getComplexTypes(payload, UUIDKey, route, callback, JWToken) {
  ComplexTypes.findPageAndCount(payload).then((data) => {
    let actions = [{
      "value": "1003",
      "type": "componentAction",
      "label": "View",
      "params": "",
      "iconName": "icon-docs",
      "URI": [
        "/editComplextypes/"
      ]
    }];

    data[0].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "ComplextypeList": {
        "action": "ComplextypeList",
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
      "ComplextypeList": {
        "action": "ComplextypeList",
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

function getComplexTypesByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    ComplexTypes.findById(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateComplexTypes": {
        "action": "AddUpdateComplexTypes",
        "data": {
          "ComplexTypes": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}

function upsertComplexTypes(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  let resp = {
    "responseMessage": {
      "action": "upsert",
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

  if (payload.typeName) {

    ComplexTypes.findById(payload).then((data) => {
      if (payload.operation === "insert" && data && data.length !== 0) {
        resp.responseMessage.data.message.status = "ERROR";
        resp.responseMessage.data.message.errorDescription = "mappingName already exist!";
        return callback(resp);
      }
      ComplexTypes.update({
        mappingName: payload.mappingName
      }, payload).then((data) => {

        resp.responseMessage.data.message.status = "OK";
        console.log(data);

        data.nModified > 0 ?
          resp.responseMessage.data.message.errorDescription = "Record Updated Success!!" :
          resp.responseMessage.data.message.errorDescription = "Record Inserted Successfully!!";

        resp.responseMessage.data.message.newPageURL = "/mappingList";
        apiDefination.LoadConfig().then(() => {
          console.log('Configurations Loaded For Request Processing!!');
        });
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
    "ComplexListData": {
      "action": "MappingConfigData",
      "data": {
        ComplexList: []
      }
    }
  };
  Promise.all([
    ComplexTypes.getServiceList()
  ]).then((data) => {
    data[0].forEach((key) => {
      let obj = {
        "label": key.typeName,
        "value": key._id
      };
      resp.ComplexListData.data.ComplexList.push(obj);
    });
    callback(resp);
  }).catch((err) => {
    callback(err);
  });
}

exports.getServiceList = getServiceList;
exports.upsertComplexTypes = upsertComplexTypes;
exports.getComplexTypesByID = getComplexTypesByID;
exports.getComplexTypes = getComplexTypes;
