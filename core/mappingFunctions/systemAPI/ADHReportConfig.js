'use strict';
const adhReport = require('../../../lib/repositories/adhReport');
const emailTemplateRepo = require('../../../lib/repositories/emailTemplate');
const endpointDefination = require('../../../lib/repositories/endpointDefination');
const sequalize = require('../../api/client/sequelize');
const {QueryTypes} = require('sequelize');
const _ = require('lodash');
const escapeString = require('sql-string-escape');
const Handlebars = require("handlebars");
const jsonexport = require('jsonexport');
const config = require('../../../config');
const nodemailer = require('nodemailer');
const rp = require("request-promise");

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
          "status": "OK",
          "errorDescription": "Processed Ok!",
          "displayToUser": true,
          "newPageURL": ""
        }
      }
    }
  };
  payload.createdBy = JWToken._id;
  let connection = undefined;
  try {


    let endpoint = await endpointDefination.findOne({id: payload.connectionString});
    connection = await sequalize(endpoint.address);
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
      for (let id in finalObj) {
        let sanitized = (finalObj[id]);
        _.set(finalObj, id, sanitized)
      }

      payload.filters.forEach((elem) => {
        if (payload.exptype != 'CSV') {
          let sanitized = (elem.testVal);
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

      if (payload.createSchedule) {
        _.set(payload, 'rawBody', undefined);
        _.set(payload, 'queryParams', undefined);
        _.set(payload, 'headersParams', undefined);
        _.set(payload, 'token', undefined);
        _.set(payload, 'action', undefined);
        _.set(payload, 'channel', undefined);
        _.set(payload, 'ipAddress', undefined);
        _.set(payload, 'query', undefined);
        _.set(payload, 'createSchedule', undefined);
        var options = {
          method: 'POST',
          uri: config.get('taskExec.url'),
          body: {
            "username": config.get('taskExec.username'),
            "password": config.get('taskExec.password'),
            "schedule_time": parseInt(payload.scheduleTime) / 1000,
            "json_payload": JSON.stringify(payload),
            "task_type": "API",
            "retry_count": 0,
            "api_url": config.get('taskExec.api_url'),
          },
          json: true // Automatically stringifies the body to JSON
        };

        rp(options)
          .then(function (parsedBody) {
            resp.responseMessage.data.message.errorDescription = "Schedule Created Successfully!!";
            callback(resp);
          })
          .catch(function (err) {
            console.log(err);
            resp.responseMessage.data.message.status = "ERROR";
            resp.responseMessage.data.message.errorDescription = err.message;
            resp.responseMessage.data.message.newPageURL = "";
            callback(resp);
          });

      } else if (payload.isScheduled && !payload.test) {
        emailTemplateRepo.findOne({templateType: 'Report'}).then(async (template) => {
          const [templateObject] = template;
          let transporter = nodemailer.createTransport({
            host: config.get('email.host'),
            port: config.get('email.port'),
            secure: config.get('email.ssl'), // use TLS
            auth: {
              user: config.get('email.address'),
              pass: config.get('email.authPassword')//
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          let dataForTemplate = payload
          let columnList = [];
          let fileCSV = "";
          let singleRecord = _.get(resultSet, '[0]', {})
          for (let key in singleRecord) {
            columnList.push(key);
          }
          fileCSV = columnList.join(',');
          fileCSV += '\r\n'
          resultSet.forEach((elem) => {
            let values = []
            columnList.forEach((col) => {
              let val = _.get(elem, col, '')
              values.push(val);
            })
            fileCSV += values.join(',');
            fileCSV += '\r\n'
          });
          await transporter.sendMail({
            from: config.get('email.address'), // sender address
            to: payload.email,  // list of receivers
            subject: templateObject.subjectEng,    // Subject line
            html: `${replaceEmailText(templateObject.templateTextEng, dataForTemplate)}`,
            attachments: [
              {
                filename: 'report.csv',
                content: fileCSV
              }]
          });
          callback(resp);

        })
      } else {
        callback(response)
      }


    } catch
      (e) {
      console.log(e)
      resp.responseMessage.data.message.status = "ERROR";
      resp.responseMessage.data.message.errorDescription = e.message;
      resp.responseMessage.data.message.newPageURL = "";
      return callback(resp)
    }
  }

}

function replaceEmailText(msg, obj) {
  let result = msg.slice(0)
  for (let key in obj) {
    let value = obj[key]
    result = result.replace('{{' + key + '}}', value)
  }

  return result
}

exports.testADHReport = testADHReport;
exports.getADHReportList = getADHReportList;
exports.getADHReportByID = getADHReportByID;
exports.updateADHReport = updateADHReport;
exports.getADHReportListProtected = getADHReportListProtected;

