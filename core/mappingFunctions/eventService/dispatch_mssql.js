'use strict';
const eventDispatcher = require('../../../lib/repositories/eventDispatcher');
const group = require('../../../lib/repositories/group');
const emailTemplate = require('../../../lib/repositories/emailTemplate');
const dates = require('../../../lib/helpers/dates');
const sqlserver = require('../../api/connectors/mssql');
const sql = require('mssql');

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
  } else {
    resp.responseMessage.data.message.errorDescription = "dispatcherName is required";
    return callback(resp);
  }
}

function getEventDispatcherStatus(payload, UUIDKey, route, callback, JWToken) {
  let queryData = 'SELECT * FROM eventdispatchqueue WHERE 1=1 ';
  let queryCnt = 'SELECT count(*) as count FROM eventdispatchqueue WHERE 1=1 ';
  let query = '';
  if (payload.searchCriteria && payload.searchCriteria.toDate && payload.searchCriteria.fromDate) {
    let fromdate = dates.ddMMyyyyslash(payload.searchCriteria.fromDate);
    let todate = dates.ddMMyyyyslash(payload.searchCriteria.toDate);
    query += ` AND DATEDIFF(SECOND,\'1970-01-01\', createdon) between  ${fromdate / 1000} AND ${todate / 1000} `;
  }

  if (payload.searchCriteria && payload.searchCriteria.eventName) {
    let eventName = payload.searchCriteria.eventName;
    query += ` AND sourceevent = '${eventName}' `;
  }

  if (payload.searchCriteria && payload.searchCriteria.status) {
    let status = payload.searchCriteria.status;
    query += ` AND status = ${status}`;
  }

  let queryCriteria = queryCnt + query;
  let queryCriteriaFull = queryData + query;
  if (payload.page) {
    queryCriteriaFull += ` order by createdon desc OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)} ROWS FETCH NEXT  ${payload.page.pageSize} ROWS ONLY`;
  }
  console.log(">>>>>>>>>>>>>>>>>>------>>>>",queryCriteriaFull);
  sqlserver.connection().then((conn) => {
    return Promise.all([
      conn.query(queryCriteria, []),
      conn.query(queryCriteriaFull, [])
    ]).then((data) => {
      conn.close();
      data[1].recordset.forEach((elemt) => {
        elemt.dispatcher = elemt.dispatcher.dispatcherName;
        elemt.datasource = elemt.datasource.dataSourceName;
        elemt.createdon = elemt.createdon;
        elemt.updatedon = elemt.updatedon;
        elemt.status = Status(elemt.status);
        elemt.actions = [{
          label: "ReQueue",
          iconName: "fa fa-recycle",
          actionType: "COMPONENT_FUNCTION"
        }, { label: "viewData", iconName: "fa fa-eye", actionType: "COMPONENT_FUNCTION" }];
      });
      console.log(JSON.stringify(data[0].recordset, null, 5))
      let response = {
        "EventDispatcherStatus": {
          "action": "EventDispatcherStatus",
          "pageData": {
            "pageSize": payload.page.pageSize,
            "currentPageNo": payload.page.currentPageNo,
            "totalRecords": data[0].recordset[0].count
          },
          "data": {
            "searchResult": data[1].recordset
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
  let queryData = `update eventdispatchqueue set status=0, retrycount=0 WHERE internalid=${payload.eventID}`;
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
  sqlserver.connection().then((conn) => {
    conn.query(queryData, []).then((data) => {
      conn.close();
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

exports.getEventDispatcherList = getEventDispatcherList;
exports.getEventDispatcher = getEventDispatcher;
exports.getEventDispatcherByID = getEventDispatcherByID;
exports.upsertEventDispatcher = upsertEventDispatcher;
exports.getEventDispatcherStatus = getEventDispatcherStatus;
exports.getDispatcherMeta = getDispatcherMeta;
exports.updateEventDispatcherStatus = updateEventDispatcherStatus;