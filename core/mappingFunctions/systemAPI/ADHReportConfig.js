'use strict';
const adhReport = require('../../../lib/repositories/adhReport');
const sequalize = require('../../api/client/sequelize');
const {QueryTypes} = require('sequelize');
const _ = require('lodash');
const SqlString = require('sqlstring');
const Handlebars = require("handlebars");
const jsonexport = require('jsonexport');

function getADHReportList(payload, UUIDKey, route, callback, JWToken, res) {
  adhReport.findPageAndCount(payload, JWToken).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/ReportAddUpdate/"
        ]
      }];
    data[1].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });
    let response = {
      "ADHReportList": {
        "action": "getADHReportList",
        "pageData": {
          "pageSize": payload.page.pageSize,
          "currentPageNo": payload.page.currentPageNo,
          "totalRecords": data[2]
        },
        "data": {
          "searchResult": data[1]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    console.log(JSON.stringify(err));
    let response = {
      "ADHReportList": {
        "action": "ADHReportList",
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

function getADHReportListProtected(payload, UUIDKey, route, callback, JWToken, res) {
  adhReport.findPageAndCount(payload, JWToken).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/ReportRender/"
        ]
      }];
    console.log(">>>>>>>>>}}}}", JSON.stringify(data[0]))
    let outVal = []
    data[1].forEach((element) => {
      let isFound = false;
      element.group.forEach((gp) => {
        if (data[0].groups.indexOf(gp) > -1) {
          isFound = true;
        }
      });

      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
      if (isFound)
        outVal.push(element);
    });
    let response = {
      "ADHReportList": {
        "action": "getADHReportList",
        "pageData": {
          "pageSize": payload.page.pageSize,
          "currentPageNo": payload.page.currentPageNo,
          "totalRecords": data[2]
        },
        "data": {
          "searchResult": outVal
        }
      }
    };
    callback(response);
  }).catch((err) => {
    console.log(JSON.stringify(err));
    let response = {
      "ADHReportList": {
        "action": "ADHReportList",
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

function getADHReportByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    adhReport.findById(payload)
  ]).then((data) => {
    let response = {
      "reportContainer": {
        "action": "reportContainer",
        "data": data[0]
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}

function updateADHReport(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  let resp = {
    "responseMessage": {
      "action": "updateADHReport",
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
    adhReport.update(payload).then((data) => {
      resp.responseMessage.data.message.status = "OK";
      resp.responseMessage.data.message.errorDescription = "Record Updated Success!!";
      resp.responseMessage.data.message.newPageURL = "/ReportList";
      callback(resp);
    });
  } else {
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = "id is required!";
    resp.responseMessage.data.message.newPageURL = "";
    return callback(resp);
  }
}

async function testADHReport(payload, UUIDKey, route, callback, JWToken, res) {

  let resp = {
    "responseMessage": {
      "action": "updateADHReport",
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
  payload.createdBy = JWToken._id;
  let connection = undefined;
  try {
    connection = await sequalize(payload.connectionString);
  } catch (e) {
    console.log(e)
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = e.message;
    resp.responseMessage.data.message.newPageURL = "";

    return callback(resp)
  }
  if (connection) {
    console.log("ADHOC Dock Connected Successfully!!")
    try {
      let finalObj = {};


      if (payload.exptype == 'CSV') {
        finalObj = payload.finalForm;
      }

      payload.filters.forEach((elem) => {
        if (payload.exptype != 'CSV') {
          let sanitized = elem.testVal;
          _.set(finalObj, elem.fieldName, sanitized)
        }

        if (elem.dataType == 'userid') {
          _.set(finalObj, elem.fieldName, JWToken.userID)
        } else if (elem.dataType == 'orgcode') {
          _.set(finalObj, elem.fieldName, JWToken.orgCode)
        } else if (elem.dataType == 'orgtype') {
          _.set(finalObj, elem.fieldName, JWToken.orgType)
        }
      })
      let source = payload.queryStr;
      let template = Handlebars.compile(source);
      console.log(finalObj)
      let qry = template(finalObj);
      const resultSet = await connection.query(qry, {
        logging: console.log,
        plain: false,
        raw: false,
        type: QueryTypes.SELECT
      });
      if (resultSet.length == 0) {
        resp.responseMessage.data.message.status = "ERROR";
        resp.responseMessage.data.message.errorDescription = 'no records found matching criteria';
        resp.responseMessage.data.message.newPageURL = "";
        return callback(resp)
      }
      let action = payload.action || 'resultSet'
      let response = {
        [action]: {
          "action": action,
          "data": resultSet
        }
      };

      callback(response)

    } catch (e) {
      console.log(e)
      resp.responseMessage.data.message.status = "ERROR";
      resp.responseMessage.data.message.errorDescription = e.message;
      resp.responseMessage.data.message.newPageURL = "";
      return callback(resp)
    }
  }

}

exports.testADHReport = testADHReport;
exports.getADHReportList = getADHReportList;
exports.getADHReportByID = getADHReportByID;
exports.updateADHReport = updateADHReport;
exports.getADHReportListProtected = getADHReportListProtected;

