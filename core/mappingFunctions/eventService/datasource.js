const dataSource = require('../../../lib/repositories/dataSource');

function getdataSource(payload, UUIDKey, route, callback, JWToken) {
  dataSource.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/editDatasource/"
        ]
      }];

    data[0].forEach(element => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "DatasourceList": {
        "action": "DatasourceList",
        "pageData": {
          "pageSize": payload.page.pageSize,
          "currentPageNo": payload.page.currentPageNo,
          "totalRecords": data[1]
        },
        "data": {
          "searchResult": data[0]


        }
      }
    }

    console.log(JSON.stringify(response))
    callback(response);
  }).catch((err) => {
    console.log(JSON.stringify(err));
    let response = {
      "DatasourceList": {
        "action": "DatasourceList",
        "pageData": {
          "pageSize": payload.page.pageSize,
          "currentPageNo": payload.page.currentPageNo,
          "totalRecords": 0
        },
        "data": {
          "searchResult": []


        }
      }
    }
    callback(response)
  })
}

function getdataSourceByID(payload, UUIDKey, route, callback, JWToken) {
  payload.userID = JWToken._id;
  dataSource.findById(payload).then((data) => {

    data.sourceDataDefination.forEach(elem => {
      elem.dataJsonStructure.forEach(e => {
        e.actions = [{label: "Delete", iconName: "fa fa-trash", actionType: "COMPONENT_FUNCTION"}]
      })
    })

    let resp = {
      "AddUpdateDatasource": {
        "action": "AddUpdateDatasource",
        "data": {
          "datasource": data
        }
      }
    };

    callback(resp);
  }).catch((err) => {
    callback(err)
  })
}

function upsertDataSource(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;
  let resp = {
    "responseMessage": {
      "action": "upsertDataSource",
      "data": {
        "message": {
          "status": "ERROR",
          "errorDescription": "Some Error Occured during operation!!, Please Contact Support",
          "displayToUser": true,
          "newPageURL": ""
        }
      }
    }
  }


  if (payload.dataSourceName) {
    dataSource.update({dataSourceName: payload.dataSourceName}, payload).then((data) => {
      resp.responseMessage.data.message.status = "OK";
      console.log(data)

      data.nModified > 0 ?
        resp.responseMessage.data.message.errorDescription = "Record Updated Success!!" :
        resp.responseMessage.data.message.errorDescription = "Record Inserted Successfully!!";

      resp.responseMessage.data.message.newPageURL = "/datasourceList"
      callback(resp);
    }).catch((err) => {
      console.log(err);
      callback(resp);
    })
  } else {
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = "Datasource Name is required!"
    resp.responseMessage.data.message.newPageURL = ""
    callback(resp);
  }
}


function getdataSourceList(payload, UUIDKey, route, callback, JWToken) {
  dataSource.getList().then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err)
  })
}

function getdataSourceService(payload, UUIDKey, route, callback, JWToken) {
  dataSource.getList().then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err)
  })
}

function getServiceList(payload, UUIDKey, route, callback, JWToken) {
  dataSource.getServiceList().then((data) => {
    callback(data);
  }).catch((err) => {
    callback(err);
  });
}

exports.getdataSourceList = getdataSourceList;
exports.getdataSource = getdataSource;
exports.getdataSourceByID = getdataSourceByID;
exports.upsertDataSource = upsertDataSource;
exports.getServiceList = getServiceList;