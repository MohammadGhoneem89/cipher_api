'use strict';
const APIDefinitation = require('../../../lib/repositories/apiDefination');
const _ = require('lodash');
function getAPIDefinition(payload, UUIDKey, route, callback, JWToken) {
  APIDefinitation.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/APIDefScreen/"
        ]
      }];

    data[0].forEach((element) => {
      element.actions = actions;
      element.hiddenID = element.useCase + "/" + element.route;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "ApiListData": {
        "action": "ApiListData",
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
      "ApiListData": {
        "action": "ApiListData",
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

function getAPIDefinitionID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    APIDefinitation.findById(payload)
  ]).then((data) => {
    let response = {
      "APIDefinitionAddUpdate": {
        "action": "APIDefinitionAddUpdate",
        "data": data[0]
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}

function upsertAPIDefinition(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;

  let resp = {
    "responseMessage": {
      "action": "upsertAPIDefinition",
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

  if (payload.route && payload.useCase) {

    APIDefinitation.findById(payload).then((data) => {
      if (payload.operation === "insert" && data && data.length !== 0) {
        resp.responseMessage.data.message.status = "ERROR";
        resp.responseMessage.data.message.errorDescription = "route & useCase already exist!";
        return callback(resp);
      }
      return APIDefinitation.update({ route: payload.route, useCase: payload.useCase }, payload).then((data) => {

        resp.responseMessage.data.message.status = "OK";
        console.log(data);

        data.nModified > 0 ?
          resp.responseMessage.data.message.errorDescription = "Record Updated Success!!" :
          resp.responseMessage.data.message.errorDescription = "Record Inserted Successfully!!";

        resp.responseMessage.data.message.newPageURL = "/ApiList";
        callback(resp);
      });

    }).catch((err) => {
      console.log(err);
      return callback(resp);
    });
  }
  else {
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = "route & useCase is required!";
    resp.responseMessage.data.message.newPageURL = "";
    return callback(resp);
  }
}

function getServiceList(payload, UUIDKey, route, callback, JWToken) {
  APIDefinitation.getServiceList().then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err);
  });
}

function getActiveAPIList(payload, UUIDKey, route, callback, JWToken) {
  APIDefinitation.getActiveAPIList(payload).then((data) => {
    let grouped = _.groupBy(data, 'useCase');
    let resp = {};
    data.forEach((data) => {
      let dest = data.useCase + "." + data.route;
      let reqMap = []
      data.RequestMapping.fields.forEach((field) => {
        if (field.IN_FIELDTYPE === "data" || field.IN_FIELDTYPE === "execFunctionOnData") {
          reqMap.push(field);
        }
      });
      let resMap = [];
      data.ResponseMapping.fields.forEach((field) => {
        resMap.push(field);
      });
      data.ResponseMapping = resMap;
      data.RequestMapping = reqMap;
      let groupedRoute = _.omit(data, 'route', 'useCase');
      _.set(resp, dest, groupedRoute);
    });
    let response = {
      "RouteList": {
        "action": "RouteList",
        "data": resp
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}

exports.getAPIDefinition = getAPIDefinition;
exports.getAPIDefinitionID = getAPIDefinitionID;
exports.upsertAPIDefinition = upsertAPIDefinition;
exports.getServiceList = getServiceList;
exports.getActiveAPIList = getActiveAPIList;
