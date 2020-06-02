'use strict';
const pg = require('../../../core/api/connectors/postgress');
const dates = require('../../../lib/helpers/dates');
const _ = require('lodash');

exports.getFileList = function (payload, UUIDKey, route, callback, JWToken) {

  let params = []
  let queryData = 'SELECT *, date_part(\'epoch\'::text,"datetime")::bigint * 1000 as "dateEpoch"  FROM file_details WHERE 1=1 ';
  let queryCnt = 'SELECT COUNT(*) FROM file_details WHERE 1=1 ';

  if (payload.searchCriteria) {
    if (payload.searchCriteria.filename) {
      let length = params.push(payload.searchCriteria.filename)

      queryData += `AND name=$${length}::varchar `;
      queryCnt += `AND name=$${length}::varchar `;

    }
    if (payload.searchCriteria.fromDate && payload.searchCriteria.toDate) {
      let fromdate = new Date(parseInt(payload.searchCriteria.fromDate))
      let todate = new Date(parseInt(payload.searchCriteria.toDate))
      let length1 = params.push(fromdate.getFullYear() + "-" + (fromdate.getMonth() + 1) + "-" + fromdate.getDate())
      let length2 = params.push(todate.getFullYear() + "-" + (todate.getMonth() + 1) + "-" + todate.getDate())
      console.log("----->" + todate.getFullYear() + "-" + (todate.getMonth() + 1) + "-" + todate.getDate())
      console.log(fromdate)
      queryData += `AND datetime between $${length1}::timestamp AND $${length2}::timestamp`
      queryCnt += `AND datetime between $${length1}::timestamp AND $${length2}::timestamp`
    }
  }
  queryData += ' ORDER BY datetime DESC';

  if (payload.page) {
    queryData += ` limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
  }


  console.log("+++", queryData)
  console.log("---", queryCnt)

  pg.connection().then((conn) => {
    return Promise.all([
      conn.query(queryData, params),
      conn.query(queryCnt, params),
    ]).then((data) => {

      let outVal = [];
      data[0].rows.forEach((elemt) => {
        let element = _.clone(elemt)
        element.action = [{
          "value": "1003",
          "type": "componentAction",
          "label": "View",
          "params": "",
          "iconName": "icon-docs",
          "URI": ["/fileData/"]
        }]
        outVal.push(element);
      })

      let response = {
        "getFileList": {
          "action": "getFileList",
          "pageData": {
            "pageSize": payload.page.pageSize,
            "currentPageNo": payload.page.currentPageNo,
            "totalRecords": data[1].rows[0].count
          },
          "data": {
            "searchResult": {
              fileList: outVal
            }
          }
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}

