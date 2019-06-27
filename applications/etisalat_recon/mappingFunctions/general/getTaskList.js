'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const dates = require('../../../../lib/helpers/dates');
const _ = require('lodash');
function getTaskList(payload, UUIDKey, route, callback, JWToken) {
  let queryData = 'SELECT task.taskid, task.status, taskdetails.attributevalue as name FROM task LEFT JOIN taskdetails ON task.taskid=taskDetails.taskid WHERE taskDetails.attributename=\'name\'';
  let queryCnt = 'SELECT count(*) FROM task WHERE 1=1 ';
  let query = '';
//   if (payload.searchCriteria && payload.searchCriteria.toDate && payload.searchCriteria.fromDate) {
//     let fromdate = dates.ddMMyyyyslash(payload.searchCriteria.fromDate);
//     let todate = dates.ddMMyyyyslash(payload.searchCriteria.toDate);
//     query += ` AND date_part('epoch'::text,"createdAt")::bigint between  ${fromdate / 1000} AND ${todate / 1000} `;
//   }

//   if (payload.searchCriteria && payload.searchCriteria.keyAttributeName) {
//     let keyAttributeName = payload.searchCriteria.keyAttributeName;
//     query += ` AND "tranxData"->'dataStructure'->>'keyAttributeName' like '%${keyAttributeName}%' `;
//   }

//   if (payload.searchCriteria && payload.searchCriteria.name) {
//     let name = payload.searchCriteria.name;
//     query += ` AND "tranxData"->'dataStructure'->>'name' like '%${name}%' `;
//   }

  let queryCriteria = queryCnt + query;
  let queryCriteriaFull = queryData + query;
  //if (payload.page) { queryCriteriaFull += ` order by "createdAt" desc limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`; }
  if (payload.page) { queryCriteriaFull += ` limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`; }
  pg.connection().then((conn) => {
      console.log("+++",queryCriteria)
      console.log("---",queryCriteriaFull)
    return Promise.all([
      conn.query(queryCriteria, []),
      conn.query(queryCriteriaFull, [])
    ]).then((data) => {
      let outVal = [];
      data[1].rows.forEach((elemt) => {
        outVal.push({
          taskId: elemt.taskid,
          status: elemt.status,
          technicianName: elemt.name,
          actions: [{ "value": "1003", "type": "componentAction", "label": "View", "params": "", "iconName": "icon-docs", "URI": ["/etisalat/datastructure"] }]
        });
      });
      let response = {
        "getTaskList": {
          "action": "getTaskList",
          "pageData": {
            "pageSize": payload.page.pageSize,
            "currentPageNo": payload.page.currentPageNo,
            "totalRecords": data[0].rows[0].count
          },
          "data": {
            "searchResult": outVal
          }
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}

exports.getTaskList = getTaskList;
