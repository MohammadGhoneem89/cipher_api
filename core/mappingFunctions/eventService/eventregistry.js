'use strict';
const eventRegistry = require('../../../lib/repositories/eventRegistry');
const dataSource = require('../../../lib/repositories/dataSource');
const eventDispatcher = require('../../../lib/repositories/eventDispatcher');

function getEventRegistry(payload, UUIDKey, route, callback, JWToken) {
  eventRegistry.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/editEventRegistry/"
        ]
      }];

    data[0].forEach((element) => {
      let dtaSource = [];
      let dspthr = [];
      element.dataSource.forEach((elem) => {
        dtaSource.push(elem.dataSourceName);
      });
      element.dipatcher.forEach((elem) => {
        dspthr.push(elem.dispatcherName);
      });
      element.dataSource = dtaSource.join(', ');
      element.dipatcher = dspthr.join(', ');
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "EventList": {
        "action": "EventList",
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
      "EventList": {
        "action": "EventList",
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

function getEventRegistryByID(payload, UUIDKey, route, callback, JWToken) {

  Promise.all([
    dataSource.getList(),
    eventDispatcher.getList(),
    eventRegistry.findById(payload)
  ]).then((data) => {

    let dtaSource = [];
    let dspthr = [];
    if (data[2]) {

      data[2].rule.forEach((elem) => {
        elem.actions = [{ label: "Delete", iconName: "fa fa-trash", actionType: "COMPONENT_FUNCTION" }];
      });

      data[2].dataSource.forEach((elem) => {
        data[0].forEach((elemt, index) => {
          if (elem.dataSourceName == elemt.dataSourceName) { dtaSource.push(index); }
        });
      });

      data[2].dipatcher.forEach((elem) => {
        data[1].forEach((elemt, index) => {
          if (elem.dispatcherName == elemt.dispatcherName) { dspthr.push(index); }
        });
      });
    }
    let response = {
      "AddUpdateEventList": {
        "action": "AddUpdateEvent",
        "data": {
          "dispatcherListAll": data[1],
          "datasourceListAll": data[0],
          "selectedDispatcher": dspthr,
          "selectedDatasource": dtaSource,
          "eventData": data[2]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });

}

function upsertEventRegistry(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;

  let resp = {
    "responseMessage": {
      "action": "upsertEventRegistry",
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

  if (payload.eventName) {

    eventRegistry.update({ eventName: payload.eventName }, payload).then((data) => {

      resp.responseMessage.data.message.status = "OK";
      console.log(data);

      data.nModified > 0 ?
        resp.responseMessage.data.message.errorDescription = "Record Updated Success!!" :
        resp.responseMessage.data.message.errorDescription = "Record Inserted Successfully!!";

      resp.responseMessage.data.message.newPageURL = "/eventList";
      callback(resp);
    }).catch((err) => {
      console.log(err);
      return callback(resp);
    });
  }
  else {
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = "Event Name is required!";
    resp.responseMessage.data.message.newPageURL = "";
    return callback(resp);
  }
}

function getServiceList(payload, UUIDKey, route, callback, JWToken) {
  eventRegistry.getServiceList().then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err);
  });
}

exports.getEventRegistry = getEventRegistry;
exports.getEventRegistryByID = getEventRegistryByID;
exports.upsertEventRegistry = upsertEventRegistry;
exports.getServiceList = getServiceList;
