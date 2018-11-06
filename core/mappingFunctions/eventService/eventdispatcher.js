'use strict';
const eventDispatcher = require('../../../lib/repositories/eventDispatcher');
const dates = require('../../../lib/helpers/dates');
const pg = require('../../api/connectors/postgress');
function getEventDispatcher(payload, UUIDKey, route, callback, JWToken) {
  eventDispatcher.findPageAndCount(payload).then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err);
  });
}

function getEventDispatcherList(payload, UUIDKey, route, callback, JWToken) {
  eventDispatcher.getList().then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err);
  });
}

function getEventDispatcherByID(payload, UUIDKey, route, callback, JWToken) {
  eventDispatcher.findById(payload).then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err);
  });
}

function upsertEventDispatcher(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  if (payload.dispatcherName) {
    eventDispatcher.update({dispatcherName: payload.dispatcherName}, payload).then((data) => {
      let response = {
        msg: data
      };
      callback(response);
    }).catch((err) => {
      let response = {
        msg: "errornous insert" + err
      };
      callback(response);
    });
  }
  else {
    let response = {
      msg: "dispatcherName is required"
    };
    return callback(response);
  }
}

function getEventDispatcherStatus(payload, UUIDKey, route, callback, JWToken) {
  let queryData = 'SELECT * FROM eventdispatchqueue WHERE 1=1 ';
  let queryCnt = 'SELECT count(*) FROM eventdispatchqueue WHERE 1=1 ';
  let query = '';
  if (payload.searchCriteria && payload.searchCriteria.toDate && payload.searchCriteria.fromDate) {
    let fromdate = dates.ddMMyyyyslash(payload.searchCriteria.fromDate);
    let todate = dates.ddMMyyyyslash(payload.searchCriteria.toDate);
    query += ` AND date_part('epoch'::text,createdon)::bigint between  ${fromdate / 1000} AND ${todate / 1000} `;
  }

  if (payload.searchCriteria && payload.searchCriteria.reqType) {
    let reqType = payload.searchCriteria.reqType;
    query += ` AND reqtype = '${reqType}' `;
  }

  if (payload.searchCriteria && payload.searchCriteria.shortCode) {
    let shortCode = payload.searchCriteria.shortCode;
    query += ` AND shortcode = '${shortCode}'`;
  }

  if (payload.searchCriteria && payload.searchCriteria.reconType) {
    let reconType = payload.searchCriteria.reconType;
    query += ` AND recontype ='${reconType}'`;
  }

  let queryCriteria = queryCnt + query;
  let queryCriteriaFull = queryData + query;
  if (payload.page) {queryCriteriaFull += ` order by createdon desc limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;}
  pg.connection().then((conn) => {
    return Promise.all([
      conn.query(queryCriteria, []),
      conn.query(queryCriteriaFull, [])
    ]).then((data) => {

      data[1].rows.forEach((elemt) => {
        elemt.dispatcher = elemt.dispatcher.dispatcherName;
        elemt.datasource = elemt.datasource.dataSourceName;
        elemt.createdon = dates.shortDate(elemt.createdon);
        elemt.updatedon = dates.shortDate(elemt.updatedon);
        elemt.status = Status(elemt.status);
      });

      let response = {
        "EventDispatcherStatus": {
          "action": "EventDispatcherStatus",
          "pageData": {
            "pageSize": payload.page.pageSize,
            "currentPageNo": payload.page.currentPageNo,
            "totalRecords": data[0].rows.count
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

function updateEventDispatcherStatus(payload, UUIDKey, route, callback, JWToken) {
  eventDispatcher.findById(payload).then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err);
  });
}

function Status(tranStatus) {
  let vs = {
    "value": "",
    "type": "INFO"
  };
  if (tranStatus == 0) {
    vs.value = 'Penfing',
    vs.type = 'WARNING';
  }
  else if (tranStatus == 1) {
    vs.value = 'Dispatched';
    vs.type = "SUCCESS";

  }
  else if (tranStatus == 3) {
    vs.value = "Fail";
    vs.type = "ERROR";
  }
  return vs;

}

exports.getEventDispatcherList = getEventDispatcherList;
exports.getEventDispatcher = getEventDispatcher;
exports.getEventDispatcherByID = getEventDispatcherByID;
exports.upsertEventDispatcher = upsertEventDispatcher;
exports.getEventDispatcherStatus = getEventDispatcherStatus;
