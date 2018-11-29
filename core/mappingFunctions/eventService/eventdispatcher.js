'use strict';
const eventDispatcher = require('../../../lib/repositories/eventDispatcher');
const group = require('../../../lib/repositories/group');
const emailTemplate = require('../../../lib/repositories/emailTemplate');
const dates = require('../../../lib/helpers/dates');
const pg = require('../../api/connectors/postgress');

function getEventDispatcher(payload, UUIDKey, route, callback, JWToken) {
  eventDispatcher.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/editDispatcher/"
        ]
      }];

    data[0].forEach((element) => {
      element.actions = actions;
      element.hiddenID = element.useCase + "/" + element.route;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "EventDispatcherList": {
        "action": "EventDispatcherList",
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
      "EventDispatcherList": {
        "action": "EventDispatcherList",
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

function getEventDispatcherList(payload, UUIDKey, route, callback, JWToken) {
  eventDispatcher.getList().then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err);
  });
}

function getEventDispatcherByID(payload, UUIDKey, route, callback, JWToken) {
  eventDispatcher.findById(payload).then((data) => {
    let response = {
      "EventDispatcherDetails": {
        "action": "EventDispatcherDetails",
        "data": data
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}

function getDispatcherMeta(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    EventDispatcherTypeList: {
      action: "EventDispatcherTypeList",
      data: {
        group: [],
        emailTemplate: []
      }
    }
  };
  Promise.all([
    group.find({}),
    emailTemplate.findTypeData()
  ]).then((data) => {
    data[0].forEach((key) => {
      let obj = {
        "label": key.name,
        "value": key.name
      };
      resp.EventDispatcherTypeList.data.group.push(obj);
    });
    data[1].forEach((key) => {
      let obj = {
        "label": key.label,
        "value": key._id
      };
      resp.EventDispatcherTypeList.data.emailTemplate.push(obj);
    });
    callback(resp);
  }).catch((err) => {
    callback(err);
  });
}

function upsertEventDispatcher(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  let resp = {
    "responseMessage": {
      "action": "upsertEventDispatcher",
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
  if (payload.dispatcherName) {
    eventDispatcher.update({ dispatcherName: payload.dispatcherName }, payload).then((data) => {
      resp.responseMessage.data.message.status = "OK";
      data.nModified > 0 ?
        resp.responseMessage.data.message.errorDescription = "Record Updated Success!!" :
        resp.responseMessage.data.message.errorDescription = "Record Inserted Successfully!!";
      resp.responseMessage.data.message.newPageURL = '/DispatchList';
      callback(resp);
    }).catch((err) => {
      console.log(err);
      callback(resp);
    });
  }
  else {
    resp.responseMessage.data.message.errorDescription = "dispatcherName is required";
    return callback(resp);
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
  if (payload.page) { queryCriteriaFull += ` order by createdon desc limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`; }
 console.log(queryCriteriaFull);
  pg.connection().then((conn) => {
    return Promise.all([
      conn.query(queryCriteria, []),
      conn.query(queryCriteriaFull, [])
    ]).then((data) => {

      data[1].rows.forEach((elemt) => {
        elemt.dispatcher = elemt.dispatcher.dispatcherName;
        elemt.datasource = elemt.datasource.dataSourceName;
        elemt.createdon = elemt.createdon;
        elemt.updatedon = elemt.updatedon;
        elemt.status = Status(elemt.status);
        elemt.actions = [{ label: "ReQueue", iconName: "fa fa-recycle", actionType: "COMPONENT_FUNCTION" }];
      });
      console.log(JSON.stringify(data[0].rows,null,5))
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

function updateEventDispatcherStatus(payload, UUIDKey, route, callback, JWToken) {
  let queryData = `update eventdispatchqueue set status=0 WHERE internalid=${payload.eventID}`;
  let resp = {
    "responseMessage": {
      "action": "upsertEventDispatcher",
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
  pg.connection().then((conn) => {
    conn.query(queryData, []).then((data) => {
      resp.responseMessage.data.message.status = "OK";
      resp.responseMessage.data.message.errorDescription = "Event ReQueued!!";
      return callback(resp);
    }).catch((ex) => {
      console.log(ex);
      return callback(resp);
    });
  }).catch((ex) => {
    console.log(ex);
    return callback(resp);
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
exports.getDispatcherMeta = getDispatcherMeta;
exports.updateEventDispatcherStatus = updateEventDispatcherStatus;