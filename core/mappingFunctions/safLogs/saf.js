'use strict';
import networkList from "../../../../../cipher_ui/core/components/BLAConfiguration/networkList";

const dates = require('../../../lib/helpers/dates');
const pg = require('../../api/connectors/postgress');

function getSafLogs(payload, UUIDKey, route, callback, JWToken) {
  let queryData = 'SELECT * FROM saflogs WHERE 1=1 ';
  let queryCnt = 'SELECT count(*) FROM saflogs WHERE 1=1 ';
  let query = '';
  if (payload.searchCriteria && payload.searchCriteria.toDate && payload.searchCriteria.fromDate) {
    let fromdate = dates.ddMMyyyyslash(payload.searchCriteria.fromDate);
    let todate = dates.ddMMyyyyslash(payload.searchCriteria.toDate);
    query += ` AND date_part('epoch'::text,createdon)::bigint between  ${fromdate / 1000} AND ${todate / 1000} `;
  }
  if (payload.searchCriteria && payload.searchCriteria.functionName) {
    let functionName = payload.searchCriteria.functionName;
    query += ` AND functionName = '${functionName}' `;
  }
  if (payload.searchCriteria && payload.searchCriteria.errormsg) {
    let errormsg = payload.searchCriteria.errormsg;
    query += ` AND errormsg like '%${errormsg}%'`;
  }
  let queryCriteria = queryCnt + query;
  let queryCriteriaFull = queryData + query;
  if (payload.page) {
    queryCriteriaFull += ` order by createdon desc limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
  }
  pg.connection().then((conn) => {
    return Promise.all([
      conn.query(queryCriteria, []),
      conn.query(queryCriteriaFull, [])
    ]).then((data) => {
      data[1].rows.forEach((elemt) => {
        elemt.status = Status(elemt.status);
        elemt.actions = [{
          label: "ReQueue",
          iconName: "fa fa-recycle",
          actionType: "COMPONENT_FUNCTION"
        }, {label: "viewData", iconName: "fa fa-eye", actionType: "COMPONENT_FUNCTION"}];
      });
      console.log(JSON.stringify(data[0].rows, null, 5))
      let response = {
        "EventDispatcherStatus": {
          "action": "EventDispatcherStatus",
          "pageData": {
            "pageSize": payload.page.pageSize,
            "currentPageNo": payload.page.currentPageNo,
            "totalRecords": data[0].rows[0].count
          },
          "data": {
            "searchResult": data[1].rows
          }
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}

function updateSafLogs() {
}

function consumeSaflogs() {
  const amq = require('../../api/connectors/queue');
  let connection = amq.start();

}


function Status(tranStatus) {
  let vs = {
    "value": "",
    "type": "INFO"
  }
  if (tranStatus === 0) {
    vs.value = 'Pending';
    vs.type = 'WARNING';
  } else if (tranStatus === 4) {
    vs.value = 'Waiting';
    vs.type = 'WARNING';
  } else if (tranStatus === 1) {
    vs.value = 'Dispatched';
    vs.type = "SUCCESS";
  } else if (tranStatus === 3) {
    vs.value = "Fail";
    vs.type = "ERROR";
  }
  return vs;

}

exports.getSafLogs = getSafLogs;
exports.updateSafLogs = updateSafLogs;