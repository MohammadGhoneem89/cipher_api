'use strict';
const fs = require('fs');
const MappingConfig = require('../../../lib/repositories/mappingConfig');
const typeData = require('../../../lib/repositories/typeData');
let customFunctions = require('../../Common/customFunctions.js');
let validationFunctions = require('../../Common/_validationFunctions.js');
const groupPermission = require('../../../lib/services/group');
let apiDefination = require('./APIDefination');
const _ = require('lodash');
function getMappingConfig(payload, UUIDKey, route, callback, JWToken) {

  MappingConfig.findPageAndCount(payload).then((data) => {
    let actions = [
      {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/editMapping/"
        ]
      }];

    data[0].forEach((element) => {
      element.actions = actions;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "MappingList": {
        "action": "MappingList",
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
      "MappingConfigList": {
        "action": "MappingConfigList",
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

function getMappingConfigOrgFieldData(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    MappingConfig.findByRequestId(payload)
  ]).then((data) => {
    let result = [];
    if (data[0].fields) {
      data[0].fields.forEach((elem, index) => {
        if (elem.IN_FIELDTYPE === 'OrgIdentifier' || elem.IN_FIELDTYPE === 'JWTORG' ) {
          result.push(elem);
        }
      });
    }
    let response = {
      "MappingOrgFieldData": {
        "action": "MappingOrgFieldData",
        "data": {
          "OrgFieldData": result
        }
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}


function getMappingConfigByID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    MappingConfig.findById(payload)
  ]).then((data) => {
    let response = {
      "AddUpdateMapping": {
        "action": "AddUpdateMapping",
        "data": {
          "MappingConfig": data[0]
        }
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}

function upsertMappingConfig(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;

  let resp = {
    "responseMessage": {
      "action": "upsertMappingConfig",
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

  if (payload.mappingName) {

    MappingConfig.findById(payload).then((data) => {
      if (payload.operation === "insert" && data && data.length !== 0) {
        resp.responseMessage.data.message.status = "ERROR";
        resp.responseMessage.data.message.errorDescription = "mappingName already exist!";
        return callback(resp);
      }
      MappingConfig.update({ mappingName: payload.mappingName }, payload).then((data) => {

        resp.responseMessage.data.message.status = "OK";
        console.log(data);

        data.nModified > 0 ?
          resp.responseMessage.data.message.errorDescription = "Record Updated Success!!" :
          resp.responseMessage.data.message.errorDescription = "Record Inserted Successfully!!";

        resp.responseMessage.data.message.newPageURL = "/mappingList";
        apiDefination.LoadConfig().then(() => {
          console.log('Configurations Loaded For Request Processing!!');
        });
        callback(resp);
      }).catch((err) => {
        console.log(err);
        return callback(resp);
      });
    });
  }
  else {
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = "mappingName is required!";
    resp.responseMessage.data.message.newPageURL = "";
    return callback(resp);
  }
}

function getServiceList(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    "MappingConfigData": {
      "action": "MappingConfigData",
      "data": {
        REQUEST: [],
        RESPONSE: []
      }
    }
  };
  Promise.all([
    MappingConfig.getServiceList("REQUEST"),
    MappingConfig.getServiceList("RESPONSE")
  ]).then((data) => {
    data[0].forEach((key) => {
      let obj = {
        "label": key.mappingName,
        "value": key._id
      };
      resp.MappingConfigData.data.REQUEST.push(obj);
    });

    data[1].forEach((key) => {
      let obj = {
        "label": key.mappingName,
        "value": key._id
      };
      resp.MappingConfigData.data.RESPONSE.push(obj);
    });
    callback(resp);
  }).catch((err) => {
    callback(err);
  });
}

function getListFunction(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    "FunctionData": {
      "action": "FunctionData",
      "data": {
        custom: [],
        validation: [],
        typeDataList: [],
        permissionList: []
      }
    }
  };
  let Projection = {
    "data": 1
  };
  Promise.all([
    groupPermission.listPermissions({}),
    typeData.selectProjected({}, Projection)
  ]).then((data) => {
    resp.FunctionData.data.permissionList = data[0];
    data[1].forEach((element) => {
      for (let key in element.data) {
        let obj = {
          "label": key,
          "value": key
        };
        resp.FunctionData.data.typeDataList.push(obj);
      }
    });
    for (let key in validationFunctions) {
      let obj = {
        "label": key,
        "value": key
      };
      resp.FunctionData.data.validation.push(obj);
    };

    for (let key in customFunctions) {
      let obj = {
        "label": key,
        "value": key
      };
      resp.FunctionData.data.custom.push(obj);
    };
    callback(resp);
  });
}


function getTypeDataList(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    "enumList": {
      "action": "enumList",
      "data": {}
    }
  };
  let Projection = {
    "data": 1
  };
  typeData.selectProjected({}, Projection).then((data) => {
    data.forEach((element) => {
      for (let key in element.data) {
        let arrEnum = [];
        element.data[key].forEach((object) => {
          arrEnum.push(object.value);
        });

        _.set(resp.enumList.data, key, arrEnum);

      }
    });

    callback(resp);
  });
}

function createDynamicStruct(payload, UUIDKey, route, callback, JWToken) {
  //console.log(payload.query, "IQRA");
  console.log(payload, "IQRA");
 
  let request = {
    "action": "mappingData",
    "searchCriteria": payload.searchCriteria,
    "page": {
      "currentPageNo": 1,
      "pageSize": 10
    }
  };

  MappingConfig.findPageAndCount(request)
    .then((data) => {
      if (data) {
        console.log(JSON.stringify(data[0][0].fields),"fieldssssssssss");
        
        fs.readFile('structTemplate.txt', 'utf8', function (err, fileData) {
          if (err) {
            return console.log(err);
          }
          console.log(fileData);
          let ifileData = fileData.replace('<<structName>>' ,payload.searchCriteria.mappingName);

          function findInd(fileData,data) {
            let mgenerateStruct = "";
            let IndxFnDef = fileData.search("<<field1>>");
            let IndxFnDefEnd = fileData.search("}");
            let GetfileData = fileData.substring(IndxFnDef, IndxFnDefEnd);
          console.log(GetfileData,"FileDataaaaaaaaaaaaaSUBSTRING")
            for(let i =0 ; i< data[0][0].fields.length ; i++)
          {
          
            let getSlicedFieldName = data[0][0].fields[i].IN_FIELD.split(".");
             let mSlicedFieldName = getSlicedFieldName[1];
             
            let  mfileData = GetfileData.replace('<<field1>>', mSlicedFieldName.charAt(0).toUpperCase()+ mSlicedFieldName.slice(1));
           mfileData = mfileData.replace('<<fieldType>>>',data[0][0].fields[i].IN_FIELDDT);
           mfileData = mfileData.replace('<<field1JSON>>',mSlicedFieldName)
           mgenerateStruct += mfileData; 
          }
          return  mgenerateStruct;
        }

        let IndxFnDef = ifileData.search("<<field1>>");
        let IndxFnDefEnd = ifileData.search("}");
        let GetfileData = ifileData.substring(IndxFnDef, IndxFnDefEnd);
        ifileData = ifileData.replace(GetfileData,findInd(fileData,data))
       
          fs.writeFile('struct.go', ifileData, 'utf8', function (err) {
            if (err) return console.log(err);
             console.log("========================fileData written\n\n\n", ifileData)
        });
        // callback(ifileData, (responseCallback) => {

        //   responseCallback.set({
        //     'Content-Type': 'application/octet-stream',
        //     'Content-Disposition': 'attachment; filename=' + "Struct.go",
        //   });
        // });
        
    });
  }
    }).catch((err) => {
      console.log(err,"errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
      callback(err);
    });
}
exports.getMappingConfig = getMappingConfig;
exports.getMappingConfigByID = getMappingConfigByID;
exports.upsertMappingConfig = upsertMappingConfig;
exports.getServiceList = getServiceList;
exports.getListFunction = getListFunction;
exports.getTypeDataList = getTypeDataList;
exports.getMappingConfigOrgFieldData = getMappingConfigOrgFieldData;
exports.createDynamicStruct = createDynamicStruct;
