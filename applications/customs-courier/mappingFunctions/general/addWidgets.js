'use strict';
// const adhReport = require('../../../../lib/models/widget.js');
// const emailTemplateRepo = require('../../../lib/repositories/emailTemplate');
// const endpointDefination = require('../../../lib/repositories/endpointDefination');
// const sequalize = require('../../api/client/sequelize');
// const { QueryTypes } = require('sequelize');
// const _ = require('lodash');
// const escapeString = require('sql-string-escape');
// const Handlebars = require("handlebars");
// const jsonexport = require('jsonexport');
// const config = require('../../../config');
// const nodemailer = require('nodemailer');
// const rp = require("request-promise");
const uuid = require('uuid/v1');
const Widgets = require('../../../../lib/models/widget.js');

async function addWidgets(payload, UUIDKey, route, callback, JWToken, res) {
    console.log(payload);
    
    const { widgetName, widgetType, widgetCaption, widgetEndpoint, status} = payload;


    let object = await Widgets.create({
            "widgetId": 'graph_' + uuid(),
            "widgetName": widgetName,
            "widgetType": widgetType,
            "widgetCaption": widgetCaption,
            "status": status,
            "widgetEndpoint": widgetEndpoint,
        });


        console.log(object);

        const resp = {
            responseMessage: {
                action: null,
                data: {
                    message: {
                        status: 'OK',
                        errorDescription: 'Success Record Created !!!',
                        displayToUser: true,
                        newPageURL: 'courier/widgetList'
                    }
                }
            }
        };
        callback(resp)
}


// async function testPagination(payload, UUIDKey, route, callback, JWToken, res) {

//   let resp = {
//     "responseMessage": {
//       "action": "updateADHReport",
//       "data": {
//         "message": {
//           "status": "OK",
//           "errorDescription": "Processed Ok!",
//           "displayToUser": true,
//           "newPageURL": ""
//         }
//       }
//     }
//   };
//   payload.createdBy = JWToken._id;
//   let connection = undefined;
//   let endpoint;
//   try {
//     endpoint = await endpointDefination.findOne({ id: payload.connectionString });
//     connection = await sequalize(endpoint.address, endpoint.protocol.secure);
//   } catch (e) {
//     console.log(e)
//     resp.responseMessage.data.message.status = "ERROR";
//     resp.responseMessage.data.message.errorDescription = e.message;
//     resp.responseMessage.data.message.newPageURL = "";
//     return callback(resp)
//   }
//   if (connection) {
//     console.log("ADHOC Dock Connected Successfully!!")
//     try {
//       let finalObj = {};
//       if (payload.searchCriteria) {
//         finalObj = payload.searchCriteria;
//       }
//       for (let id in finalObj) {
//         let sanitized = (finalObj[id]);
//         _.set(finalObj, id, sanitized)
//       }

//       let pageSise = _.get(payload, 'page.pageSize', 10);
//       let currentPageNo = _.get(payload, 'page.currentPageNo', 1) - 1;

//       payload.filters.forEach((elem) => {
//         if (payload.exptype != 'CSV') {
//           let sanitized = (elem.testVal);
//           _.set(finalObj, elem.fieldName, sanitized)
//         }
//         if (elem.dataType == 'userid') {
//           _.set(finalObj, elem.fieldName, JWToken.userID)
//         } else if (elem.dataType == 'orgcode') {
//           _.set(finalObj, elem.fieldName, JWToken.orgCode)
//         } else if (elem.dataType == 'orgtype') {
//           _.set(finalObj, elem.fieldName, JWToken.orgType)
//         }
//       });

//       let resultSet = [];
//       console.log('finalObj', finalObj)
//       let querySet = [payload.queryStrCnt, payload.queryStr];
//       for (let qryElem of querySet) {
//         let qry = qryElem + " ";
//         while (qry.match(/\[(.*?)\]/) && qry.match(/\[(.*?)\]/).length > 0) {
//           let ignoreTag = false;

//           let matches = qry.match(/\[(.*?)\]/);
//           if (matches[0] == `[LIMIT]`) {
//             if (endpoint.dbType == 'mssql~orm') {
//               qry = qry.replace(/\[(.*?)\]/, ``);
//               continue;
//             } else if (endpoint.dbType == 'postgres~orm') {
//               qry = qry.replace(/\[(.*?)\]/, `limit ${pageSise}`);
//               continue;
//             }
//           }
//           if (matches[0] == `[OFFSET]`) {
//             if (endpoint.dbType == 'mssql~orm') {
//               if (String(qry).toLowerCase().indexOf('order by') == -1) {
//                 resp.responseMessage.data.message.status = "ERROR";
//                 resp.responseMessage.data.message.errorDescription = "'ORDER BY' clause is required";
//                 resp.responseMessage.data.message.newPageURL = "";
//                 return callback(resp);
//               }
//               qry = qry.replace(/\[(.*?)\]/, `OFFSET ${currentPageNo * pageSise} ROWS FETCH NEXT ${pageSise} ROWS ONLY`);
//               continue;
//             } else if (endpoint.dbType == 'postgres~orm') {
//               qry = qry.replace(/\[(.*?)\]/, `OFFSET ${currentPageNo * pageSise} `);
//               continue;
//             }
//           }
//           console.log(matches[0], 'replaced')
//           let litmus = _.cloneDeep(matches[1]);
//           while (litmus.match(/\{{(.*?)\}}/) && litmus.match(/\{{(.*?)\}}/).length > 0) {
//             let matches2 = litmus.match(/\{{(.*?)\}}/);
//             let x = _.get(finalObj, matches2[1], undefined);
//             if (!x) {
//               ignoreTag = true;
//               break;
//             } else {
//               litmus = litmus.replace(/\{{(.*?)\}}/, '');
//             }
//             console.log(litmus, 'replaceddd');
//           }
//           if (ignoreTag) {
//             qry = qry.replace(/\[(.*?)\]/, '');
//           } else {
//             let template = Handlebars.compile(matches[1]);
//             let replaced = template(finalObj);
//             qry = qry.replace(/\[(.*?)\]/, replaced);
//             console.log(replaced, 'replaced');
//           }
//         }


//         let resultSetTemp = await connection.query(qry, {
//           logging: console.log,
//           plain: false,
//           raw: false,
//           type: QueryTypes.SELECT
//         });
//         resultSet.push(resultSetTemp)
//       }

//       // if (resultSet.length == 0) {
//       //   resp.responseMessage.data.message.status = "ERROR";
//       //   resp.responseMessage.data.message.errorDescription = 'no records found matching criteria';
//       //   resp.responseMessage.data.message.newPageURL = "";
//       //   return callback(resp)
//       // }


//       let action = payload.actionType || payload.action || 'resultSet'

//       let actionList = _.get(payload, 'actionList', []);
//       console.log(JSON.stringify(resultSet[0]))
//       // application actions apply
//       let returnData = _.get(resultSet, '[1]', []);
//       returnData.forEach((record) => {
//         let x = _.get(record, 'actions', []);
//         actionList.forEach((elem) => {
//           x.push({
//             "value": "1003",
//             "type": "componentAction",
//             "label": elem.label,
//             "params": "",
//             "iconName": "icon-docs",
//             "URI": [
//               elem.URI
//             ]
//           });
//         })
//         if (actionList.length > 0)
//           _.set(record, 'actions', x)
//       })
//       let response = {
//         [action]: {
//           "pageData": {
//             "pageSize": pageSise || 10,
//             "currentPageNo": _.get(payload, 'page.currentPageNo', 1),
//             "totalRecords": _.get(resultSet, '[0][0].count', 0)
//           },
//           "data": {
//             "searchResult": returnData
//           }
//         }
//       };

//       if (payload.createSchedule) {
//         _.set(payload, 'rawBody', undefined);
//         _.set(payload, 'queryParams', undefined);
//         _.set(payload, 'headersParams', undefined);
//         _.set(payload, 'token', undefined);
//         _.set(payload, 'action', undefined);
//         _.set(payload, 'channel', undefined);
//         _.set(payload, 'ipAddress', undefined);
//         _.set(payload, 'query', undefined);
//         _.set(payload, 'createSchedule', undefined);
//         var options = {
//           method: 'POST',
//           uri: config.get('taskExec.url'),
//           body: {
//             "username": config.get('taskExec.username'),
//             "password": config.get('taskExec.password'),
//             "schedule_time": parseInt(payload.scheduleTime) / 1000,
//             "json_payload": JSON.stringify(payload),
//             "task_type": "API",
//             "retry_count": 0,
//             "api_url": config.get('taskExec.api_url'),
//           },
//           json: true // Automatically stringifies the body to JSON
//         };

//         rp(options)
//           .then(function (parsedBody) {
//             resp.responseMessage.data.message.errorDescription = "Schedule Created Successfully!!";
//             callback(resp);
//           })
//           .catch(function (err) {
//             console.log(err);
//             resp.responseMessage.data.message.status = "ERROR";
//             resp.responseMessage.data.message.errorDescription = err.message;
//             resp.responseMessage.data.message.newPageURL = "";
//             callback(resp);
//           });

//       } else if (payload.isScheduled && !payload.test) {
//         emailTemplateRepo.findOne({ templateType: 'Report' }).then(async (template) => {
//           const [templateObject] = template;
//           let transporter = nodemailer.createTransport({
//             host: config.get('email.host'),
//             port: config.get('email.port'),
//             secure: config.get('email.ssl'), // use TLS
//             requireTLS: config.get('email.requireTLS', false),
//             auth: {
//               user: config.get('email.username'),
//               pass: config.get('email.authPassword')//
//             },
//             tls: {
//               rejectUnauthorized: config.get('email.rejectUnauthorized', false)
//             }
//           });

//           let dataForTemplate = payload
//           let columnList = [];
//           let fileCSV = "";
//           let singleRecord = _.get(resultSet, '[0]', {})
//           for (let key in singleRecord) {
//             columnList.push(key);
//           }
//           fileCSV = columnList.join(',');
//           fileCSV += '\r\n'
//           resultSet.forEach((elem) => {
//             let values = []
//             columnList.forEach((col) => {
//               let val = _.get(elem, col, '')
//               values.push(val);
//             })
//             fileCSV += values.join(',');
//             fileCSV += '\r\n'
//           });
//           await transporter.sendMail({
//             from: config.get('email.address'), // sender address
//             to: payload.email,  // list of receivers
//             subject: templateObject.subjectEng,    // Subject line
//             html: `${replaceEmailText(templateObject.templateTextEng, dataForTemplate)}`,
//             attachments: [
//               {
//                 filename: 'report.csv',
//                 content: fileCSV
//               }]
//           });
//           callback(resp);

//         })
//       } else {
//         callback(response)
//       }


//     } catch (e) {
//       console.log(e)
//       resp.responseMessage.data.message.status = "ERROR";
//       resp.responseMessage.data.message.errorDescription = e.message;
//       resp.responseMessage.data.message.newPageURL = "";
//       return callback(resp)
//     }
//   }

// }


// exports.testPagination = testPagination;
exports.addWidgets = addWidgets;

