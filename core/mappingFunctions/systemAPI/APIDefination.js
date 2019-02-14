'use strict';

const path = require('path');    
let readfileFromPath = path.join(__dirname, './Chaincode/ChaincodeTemplate.txt');
let writefileToPath = path.join(__dirname, './Chaincode/chaincode.go');
let readfileFromPathStruct = path.join(__dirname, './Chaincode/structTemplate.txt');
let writefileToPathStruct = path.join(__dirname, './Chaincode/struct.go');
const APIDefinitation = require('../../../lib/repositories/apiDefination');
const _ = require('lodash');
const typeData = require('../../../lib/repositories/typeData');
const fs = require('fs');

function updateRequestStub(payload, route, useCase) {
  let query = {
    'sampleRequest': payload
  };
  APIDefinitation.update({
    route: route,
    useCase: useCase
  }, query).then((data) => {
    console.log("request Sample Updated!");
  });
}

function LoadConfig() {
  let Projection = {
    "data": 1
  };
  return Promise.all([
    typeData.selectProjected({}, Projection),
    APIDefinitation.getAPIConfig()
  ]).then((data) => {
    let typeObj = {};
    data[0].forEach((element) => {
      for (let key in element.data) {
        let arrEnum = [];
        element.data[key].forEach((object) => {
          arrEnum.push(object.value);
        });
        _.set(typeObj, key, arrEnum);
      }
    });

    let grouped = _.groupBy(data[1], 'useCase');
    let routeConfig = {};
    data[1].forEach((data) => {
      let deepData = _.cloneDeep(data);
      let dest = data.useCase + "." + data.route;
      deepData.RequestMapping = data.RequestMapping.fields;
      deepData.RequestTransformations = data.RequestMapping.transformations;
      deepData.ResponseMapping = data.ResponseMapping.fields;
      deepData.ResponseTransformations = data.ResponseMapping.transformations;
      let groupedRoute = _.omit(deepData, 'route', 'useCase');
      _.set(routeConfig, dest, groupedRoute);
    });
    global.routeConfig = routeConfig;
    global.enumInfo = typeObj;
    return Promise.resolve();

  });
}

function getAPIDefinition(payload, UUIDKey, route, callback, JWToken) {
  APIDefinitation.findPageAndCount(payload).then((data) => {
    let actions = [{
      "value": "1003",
      "type": "componentAction",
      "label": "View",
      "params": "",
      "iconName": "icon-docs",
      "URI": [
        "/APIDefScreen/"
      ]
    }];

    data[0].forEach((element) => {
      element.actions = actions;
      element.hiddenID = element.useCase + "/" + element.route;
      element.createdBy = element.createdBy ? element.createdBy.userID : '';
    });

    let response = {
      "ApiListData": {
        "action": "ApiListData",
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
      "ApiListData": {
        "action": "ApiListData",
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

function getAPIDefinitionID(payload, UUIDKey, route, callback, JWToken) {
  Promise.all([
    APIDefinitation.findById(payload)
  ]).then((data) => {
    let response = {
      "APIDefinitionAddUpdate": {
        "action": "APIDefinitionAddUpdate",
        "data": data[0]
      }
    };
    callback(response);
  }).catch((err) => {
    callback(err);
  });
}

function upsertAPIDefinition(payload, UUIDKey, route, callback, JWToken) {
  payload.createdBy = JWToken._id;

  let resp = {
    "responseMessage": {
      "action": "upsertAPIDefinition",
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

  if (payload.route && payload.useCase) {
    APIDefinitation.findById(payload).then((data) => {
      if (payload.operation === "insert" && data && data.length !== 0) {
        resp.responseMessage.data.message.status = "ERROR";
        resp.responseMessage.data.message.errorDescription = "route & useCase already exist!";
        return callback(resp);
      }
      return APIDefinitation.update({
        route: payload.route,
        useCase: payload.useCase
      }, payload).then((data) => {

        resp.responseMessage.data.message.status = "OK";
        console.log(data);

        data.nModified > 0 ?
          resp.responseMessage.data.message.errorDescription = "Record Updated Success!!" :
          resp.responseMessage.data.message.errorDescription = "Record Inserted Successfully!!";

        resp.responseMessage.data.message.newPageURL = "/ApiList";
        LoadConfig().then(() => {
          console.log('Configurations Loaded For Request Processing!!');
        });
        callback(resp);
      });

    }).catch((err) => {
      console.log(err);
      return callback(resp);
    });
  }
  else {
    resp.responseMessage.data.message.status = "ERROR";
    resp.responseMessage.data.message.errorDescription = "route & useCase is required!";
    resp.responseMessage.data.message.newPageURL = "";
    return callback(resp);
  }
}

function getServiceList(payload, UUIDKey, route, callback, JWToken) {
  APIDefinitation.getServiceList().then((data) => {
    let resp = {
      "ApiListCombo": {
        "action": "ApiListCombo",
        "data": {
          ApiList: []
        }
      }
    };
    data.forEach((key) => {
      let obj = {
        "label": `/${key.useCase}/${key.route}`,
        "value": `/${key.useCase}/${key.route}`
      };
      resp.ApiListCombo.data.ApiList.push(obj);
    });
    callback(resp);
  }).catch((err) => {
    callback(err);
  });
}

function getActiveAPIList(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    "responseMessage": {
      "action": "upsertAPIDefinition",
      "data": {
        "message": {
          "status": "ERROR",
          "errorDescription": "Route and UseCase must be provided!!",
          "displayToUser": true,
          "newPageURL": ""
        }
      }
    }
  };
  if (!payload.route || !payload.useCase) {
    return callback(resp);
  }
  APIDefinitation.getActiveAPIList(payload).then((data) => {
    let grouped = _.groupBy(data, 'useCase');
    let resp = {};
    data.forEach((data) => {
      let dest = data.useCase + "." + data.route;
      let reqMap = [];
      data.RequestMapping.fields.forEach((field) => {
        if (field.IN_FIELDTYPE === "data" || field.IN_FIELDTYPE === "execFunctionOnData" || field.IN_FIELDTYPE === "OrgIdentifier") {
          reqMap.push(field);
        }
      });
      let resMap = [];
      data.ResponseMapping.fields.forEach((field) => {
        resMap.push(field);
      });
      data.ResponseMapping = resMap;
      data.RequestMapping = reqMap;
      let groupedRoute = _.omit(data, 'route', 'useCase');
      _.set(resp, dest, groupedRoute);
    });
    let response = {
      "RouteList": {
        "action": "RouteList",
        "data": resp
      }
    };

    callback(response);
  }).catch((err) => {
    callback(err);
  });
}

function getActiveAPIs(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    "getActiveAPIs": {
      "action": "getActiveAPIs",
      "data": {
        "message": {
          "status": "ERROR",
          "errorDescription": "UseCase must be provided!!",
          "displayToUser": true,
          "newPageURL": ""
        }
      }
    }
  };
  if (!payload.useCase) {
    return callback(resp);
  }
  APIDefinitation.getActiveAPIs(payload).then((data) => {
    if (data) {
      callback(data);
    }

  }).catch((err) => {
    callback(err);
  });
}

function downloadChainCode(payload, UUIDKey, route, callback, JWToken) {
  let chainCodeData = [];
  let responses = [];
  console.log(payload, "IQRA");

  let request = {
    "action": "mappingData",
    "searchCriteria": payload.searchCriteria,
    "page": {
      "currentPageNo": 1,
      "pageSize": 10
    }
  };
  APIDefinitation.findPageAndCount(request)
    .then((data) => {

      console.log(readfileFromPath,"pathhhhhhhhhhhh")
      console.log(readfileFromPathStruct,"lllllllllll")
      function findIndex(ifileData) {
        let startIndex = ifileData.search("<<field>>");
        let endIndex = ifileData.search("  }");
        let GetData = ifileData.substring(startIndex, endIndex);
        return GetData;
      }

      function replaceM(fileData) {
        let mfileData = ""; let gData = "";

        let yData = "";
        let iData = findIn(fileData);
        let tData = findIndex(fileData);
        let ufileData = ""; let comData = ""; let fData = "";
        for (let i = 0; i < data[0].length; i++) {

          ufileData = fileData.replace('<<structName>>', data[0][i].route);
          // console.log(ufileData);
          gData = "";
          for (let j = 0; j < data[0][i].RequestMapping.fields.length; j++) {
            mfileData = iData.replace('<<field1>>', data[0][i].RequestMapping.fields[j].IN_FIELD.charAt(0).toUpperCase() + data[0][i].RequestMapping.fields[j].IN_FIELD.slice(1)); /* .charAt(0).toUpperCase() + mSlicedFieldName.slice(1)*/
            mfileData = mfileData.replace('<<fieldType>>', data[0][i].RequestMapping.fields[j].IN_FIELDDT);
            mfileData = mfileData.replace('<<field1JSON>>', data[0][i].RequestMapping.fields[j].IN_FIELD);

            gData += mfileData + "\n";
          }
          ufileData = ufileData.replace(iData, gData);
          ufileData = ufileData.replace(/<<structName>>/g, data[0][i].route);

          for (let j = 0; j < data[0][i].RequestMapping.fields.length; j++) {

            let hData = tData.replace('<<field>>', data[0][i].RequestMapping.fields[j].IN_FIELD.charAt(0).toUpperCase() + data[0][i].RequestMapping.fields[j].IN_FIELD.slice(1));
            hData = hData.replace(/<<fieldType>>/g, data[0][i].RequestMapping.fields[j].IN_FIELDDT);
            hData = hData.replace('<<currentNo>>', j);
            fData += hData + "\n";
            if (j === data[0][i].RequestMapping.fields.length - 1) {
              yData = fData;
              // console.log(fData);
              fData = "";
            }
          }
          ufileData = ufileData.replace(tData, yData);
          comData += ufileData;
        }
        return comData;
      }

      function findIn(ifileData) {
        let startIndex = ifileData.search("<<field1>>");
        let endIndex = ifileData.search(" }");
        let GetData = ifileData.substring(startIndex, endIndex);
        return GetData;
      }

      fs.readFile(readfileFromPathStruct, 'utf8', function (err, fileData) {
        if (err) {
          return console.log(err);
        }
        let readUpdatedFile = replaceM(fileData);
        fs.writeFile(writefileToPathStruct, readUpdatedFile, 'utf8', function (err) {
          if (err) return console.log(err);
        });

      });
      data[0].map((item) => {
        if (item.isSmartContract === true && item.isActive === true) {
          chainCodeData.push({
            'isActive': item.isActive,
            'MSP': item.MSP,
            'description': item.description,
            'route': item.route,
            'useCase': item.useCase,
            'isSmartContract': item.isSmartContract,
            'RequestMapping': item.RequestMapping
          });
        }
      });

      {
        responses.push({
          ApiListData: {
            useCase: chainCodeData[0].useCase,
            APIdata: []
          }
        });
      }
      let response = {};
      for (let i = 0; i < chainCodeData.length; i++) {
        {
          response = {
            "MSP": chainCodeData[i].MSP,
            "APIList": [
              {
                "route": chainCodeData[i].route,
                "purpose": chainCodeData[i].description

              }
            ],
            "RequestMapping": chainCodeData[i].RequestMapping
          };
          responses[0].ApiListData.APIdata.push(response);
        }

      }
      for (let j = 0; j < responses[0].ApiListData.APIdata.length; j++) {
          responses[0].ApiListData.APIdata[j].RequestMapping.fields = responses[0].ApiListData.APIdata[j].RequestMapping.fields.filter(function (item) {   
            return (item.IN_FIELDDT !== 'array' && item.IN_FIELDDT !== 'object' );
          });
         // console.log("********",responses[0].ApiListData.APIdata[j].RequestMapping.fields,"******");
      }

      let DupIndex = [];

      function removeDuplicatesBy(comparator, array) {
        let unique = [];
        for (let i = 0; i < array.length; i++) {
          let isUnique = true;
          for (let j = 0; j < i; j++) {
            if (comparator(array[i], array[j])) {
              isUnique = false;
              DupIndex.push(i);
              break;
            }
          }
          if (isUnique) unique.push(array[i]);
        }
        // console.log(unique)
        return unique;
      }

      let uniqueMSP = removeDuplicatesBy(function (a, b) {
        return a.MSP === b.MSP;
      }, responses[0].ApiListData.APIdata);
      // console.log("unique : \n", uniqueMSP, "\n DupIndex :", DupIndex)

      for (let m = 0; m < responses[0].ApiListData.APIdata.length; m++) {
        for (let k = 0; k < DupIndex.length; k++) {
          if (responses[0].ApiListData.APIdata[m].MSP == responses[0].ApiListData.APIdata[DupIndex[k]].MSP) {
            responses[0].ApiListData.APIdata[m].APIList.push(responses[0].ApiListData.APIdata[DupIndex[k]].APIList[0]);

          }
        }
      }

      responses[0].ApiListData.APIdata = uniqueMSP;
      //console.log(responses[0].ApiListData.APIdata)

      let newData = "", updateIndex = "";
      let mData = "", mData2 = "", mData3 = "", wData = "";
      let mData1 = "";
      function findFnLogicIndex(data) {
        let funcLogicStart = data.search("//<<Function Validation Logic-Start>>");
        let funcLogicEnd = data.search("//<<Function Validation Logic - End>>");
        updateIndex = data.substring(funcLogicStart, funcLogicEnd);
        return updateIndex;
      }
      function mspFunctionsLogic(data) {
        let getUpdatedInd = findFnLogicIndex(data);
        for (let i = 0; i < responses[0].ApiListData.APIdata.length; i++) {
          wData = "";

          if (i > 0) { newData = "\n"; }
          newData += getUpdatedInd.replace(/<<MSP>>/g, responses[0].ApiListData.APIdata[i].MSP);

          mData = newData.search("//<<FunctionCases-Start>>");
          mData2 = newData.search("//<<FunctionCases-End>>");
          mData3 = newData.substring(mData, mData2);

          for (let j = 0; j < responses[0].ApiListData.APIdata[i].APIList.length; j++) {

            wData += mData3.replace(/<<FunctionName>>/g, responses[0].ApiListData.APIdata[i].APIList[j].route);
            // ifileData = ifileData.replace(findIn(ifileData), fillStruct(ifileData, data));

            if (j === responses[0].ApiListData.APIdata[i].APIList.length - 1) {
              mData1 += newData.replace(mData3, wData);
            }
          }

        }
        return mData1;

      }

      //
      let xData = "";// let gData = "";
      let fData = ""; let tData = ""; let fileData = "";
      function findFnDescInd(data) {
        let IndxFnDef = data.search("//<<FunctionDefinition - Start>>");
        let IndxFnDefEnd = data.search("//<<FunctionDefinition - End>>");
        let GetData = data.substring(IndxFnDef, IndxFnDefEnd);
        return GetData;
      }
      function mspFunctionDesc(tdata) {
        let yData = "";
        let fiData = ""; let qData = ""
        for (let i = 0; i < responses[0].ApiListData.APIdata.length; i++) {

          let getFnDescInd = findFnDescInd(tdata, data);
          let sData = getFnDescInd.replace(/<<UseCase>>/g, responses[0].ApiListData.useCase);
          // console.log(gData, "rrrrrrrrrrrrrrrrrrrrrrr");
          for (let j = 0; j < responses[0].ApiListData.APIdata[i].APIList.length; j++) {
            {
              let gData = sData.replace(/<<FunctionName>>/g, responses[0].ApiListData.APIdata[i].APIList[j].route);
              gData = gData.replace(/<<structName>>/g, responses[0].ApiListData.APIdata[i].APIList[j].route);

              fData = gData.replace(/<<FunctionDescription>>/g, responses[0].ApiListData.APIdata[i].APIList[j].purpose);

              tData = findIndex(fData);
              String.prototype.capitalize = function() {
                return this.charAt(0).toUpperCase() + this.slice(1);
            }

              for (let j = 0; j < responses[0].ApiListData.APIdata[i].RequestMapping.fields.length; j++) {
                let getSlicedFieldName = responses[0].ApiListData.APIdata[i].RequestMapping.fields[j].IN_FIELD.split(".");
               let updateField = getSlicedFieldName[1]
               if(updateField != undefined)
               updateField = updateField.capitalize();
                //let fieldNameCapitalized = mSlicedFieldName.capitalizeFirstLetter();
                  //console.log(mSlicedFieldName)
                let hData = tData.replace('<<field>>', updateField);
                hData = hData.replace(/<<fieldType>>/g, responses[0].ApiListData.APIdata[i].RequestMapping.fields[j].IN_FIELDDT);
                hData = hData.replace('<<currentNo>>', j);
                // console.log(yData) 
                fiData += hData + "\n";


                if (j === responses[0].ApiListData.APIdata[i].RequestMapping.fields.length - 1) {
                  //console.log("***********", fiData, "***********")
                  fData = fData.replace(tData, fiData);
                  // yData += fiData + "\n";
                  fiData = "";
                }
              }
            }
            xData += fData;

          }
        }

        return xData;
      }
      //console.log("DONE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
     
      fs.readFile(readfileFromPath, 'utf8', function (err, tdata) {
        if (err) {
          return console.log(err);

        }
        let fData = tdata.replace(/<<UseCase>>/g, responses[0].ApiListData.useCase);
        let overWrite = mspFunctionsLogic(tdata);
        let overWriteAgain = mspFunctionDesc(tdata, data);

        let getFnLogicInd = findFnLogicIndex(fData);
        let Ldata = fData.replace(getFnLogicInd, overWrite);

        let getFnDescInd = findFnDescInd(fData);
        let hData = Ldata.replace(getFnDescInd, overWriteAgain);

        fs.writeFile(writefileToPath, hData, 'utf8', function (err) {
          if (err) return console.log(err);
          //  console.log(hData, "writeen !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        });
        // callback(hData, (responseCallback) => {

        //   responseCallback.set({
        //     'Content-Type': 'application/octet-stream',
        //     'Content-Disposition': 'attachment; filename=' + "PRChainCode.go"
        //   });
        // });
      });
    }).catch((err) => {
      console.log(err);
      console.log(JSON.stringify(err));
      for (let i = 0; i < chainCodeData.length; i++) {
        let response = {
          "ApiListData": {
            "useCase": "",
            "APIdata": [
              {
                "MSP": "",
                "APIList": [
                  {
                    "route": "",
                    "purpose": ""

                  }

                ]
              }
            ]
          }
        };
        // console.log(response)
        // }).catch((err) => {
        //   console.log(err, "errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        //   callback(err);
        // });

      }
    });
}

exports.downloadChainCode = downloadChainCode;
exports.getAPIDefinition = getAPIDefinition;
exports.getAPIDefinitionID = getAPIDefinitionID;
exports.upsertAPIDefinition = upsertAPIDefinition;
exports.getServiceList = getServiceList;
exports.getActiveAPIList = getActiveAPIList;
exports.LoadConfig = LoadConfig;
exports.updateRequestStub = updateRequestStub;
exports.getActiveAPIs = getActiveAPIs;

