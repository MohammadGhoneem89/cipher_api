'use strict';

const { APIDefination, Permission } = require("../../../lib/models/index");

const path = require('path');
const zipafolder = require('zip-a-folder');
const readfileFromPath = path.join(__dirname, './Chaincode/ChaincodeTemplate.txt');
const writefileToPath = path.join(__dirname, './Chaincode/chaincode.go');
const readfileFromPathStruct = path.join(__dirname, './Chaincode/structTemplate.txt');
const writefileToPathStruct = path.join(__dirname, './Chaincode/struct.go');
const APIDefinitation = require('../../../lib/repositories/apiDefination');
const complexType = require('../../../lib/repositories/complexTypes');
const _ = require('lodash');
const typeData = require('../../../lib/repositories/typeData');
const fs = require('fs');

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
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
      let complexTypeList = [];
      data.RequestMapping.fields.forEach((field) => {
        if (field.IN_FIELDTYPE === "data" || field.IN_FIELDTYPE === "execFunctionOnData" || field.IN_FIELDTYPE === "OrgIdentifier") {
          reqMap.push(field);
          if (field.IN_FIELDCOMPLEXTYPEDATA && field.IN_FIELDCOMPLEXTYPEDATA != "")
            complexTypeList.push(field.IN_FIELDCOMPLEXTYPEDATA)

          if (field.MAP_FIELDCOMPLEXTYPEDATA && field.MAP_FIELDCOMPLEXTYPEDATA != "")
            complexTypeList.push(field.MAP_FIELDCOMPLEXTYPEDATA)
        }
      });

      let resMap = [];
      data.ResponseMapping.fields.forEach((field) => {
        if (field.IN_FIELDCOMPLEXTYPEDATA && field.IN_FIELDCOMPLEXTYPEDATA != "")
          complexTypeList.push(field.IN_FIELDCOMPLEXTYPEDATA)

        if (field.MAP_FIELDCOMPLEXTYPEDATA && field.MAP_FIELDCOMPLEXTYPEDATA != "")
          complexTypeList.push(field.MAP_FIELDCOMPLEXTYPEDATA)
        resMap.push(field);
      });
      data.ResponseMapping = resMap;
      data.RequestMapping = reqMap;
      let groupedRoute = _.omit(data, 'route', 'useCase');
      _.set(resp, dest, groupedRoute);
      data.useCase + "." + data.route

      return complexType.findByComplexTypeIds(Array.from(new Set(complexTypeList))).then((detailList) => {
        _.set(resp, `${data.useCase}.${data.route}.complexList`, detailList)
        let response = {
          "RouteList": {
            "action": "RouteList",
            "data": resp
          }
        };
        return callback(response);
      })
    });
  }).catch((err) => {
    callback(err);
  });
}

function getActiveAPIListForDocumentation(payload, UUIDKey, route, callback, JWToken) {
  let resp = {
    "responseMessage": {
      "action": "upsertAPIDefinition",
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
  APIDefinitation.getActiveAPIListForDocumentation(payload).then( async (data) => {
    console.log('dididididi', JSON.stringify(data));
    let resp = {};
    for (const useCaseObj of data) {
      let dest = useCaseObj.useCase + "." + useCaseObj.route;
      let reqMap = [];
      let complexTypeList = [];
      useCaseObj.RequestMapping.fields.forEach((field) => {
        if (field.IN_FIELDTYPE === "data" || field.IN_FIELDTYPE === "execFunctionOnData" || field.IN_FIELDTYPE === "OrgIdentifier") {
          reqMap.push(field);
          if (field.IN_FIELDCOMPLEXTYPEDATA && field.IN_FIELDCOMPLEXTYPEDATA !== "")
            complexTypeList.push(field.IN_FIELDCOMPLEXTYPEDATA)

          if (field.MAP_FIELDCOMPLEXTYPEDATA && field.MAP_FIELDCOMPLEXTYPEDATA !== "")
            complexTypeList.push(field.MAP_FIELDCOMPLEXTYPEDATA)
        }
      });
      let resMap = [];
      useCaseObj.ResponseMapping.fields.forEach((field) => {
        if (field.IN_FIELDCOMPLEXTYPEDATA && field.IN_FIELDCOMPLEXTYPEDATA != "")
          complexTypeList.push(field.IN_FIELDCOMPLEXTYPEDATA)

        if (field.MAP_FIELDCOMPLEXTYPEDATA && field.MAP_FIELDCOMPLEXTYPEDATA != "")
          complexTypeList.push(field.MAP_FIELDCOMPLEXTYPEDATA)
        resMap.push(field);
      });
      useCaseObj.ResponseMapping = resMap;
      useCaseObj.RequestMapping = reqMap;
      let groupedRoute = _.omit(useCaseObj, 'route', 'useCase');
      _.set(resp, dest, groupedRoute);
      const detailList = await complexType.findByComplexTypeIds(Array.from(new Set(complexTypeList)));
      if (detailList) {
        _.set(resp, `${useCaseObj.useCase}.${useCaseObj.route}.complexList`, detailList)
      }

    }
    let response = {
      "RouteList": {
        "action": "RouteList",
        "data": resp
      }
    };

    return callback(response);

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
  let storeDuplicate = [];
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

      function findIndex(ifileData) {
        let startIndex = ifileData.search("<<field>>");
        let endIndex = ifileData.search("  }");
        let GetData = ifileData.substring(startIndex, endIndex);
        return GetData;
      }
      
      data[0].map((item) => {
        console.log(item.route, ">>>>>>>???????>   DATA [0]")
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
      // console.log(chainCodeData,">>>>>>>???????>chainCodeData")
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
                "purpose": chainCodeData[i].description,
                "RequestMapping": chainCodeData[i].RequestMapping
              }
            ],

          };
          responses[0].ApiListData.APIdata.push(response);
        }

      }
      // console.log(JSON.stringify(responses[0].ApiListData.APIdata), ">>>>>>>???????>BEFOFRE LENGTH  ")
      // console.log(">>>>>>>>>+++++++++++++++++++======================>?????????????????????????????????")
      for (let j = 0; j < responses[0].ApiListData.APIdata.length; j++) {
        for (let k = 0; k < responses[0].ApiListData.APIdata[j].APIList.length; k++) {
          // for (let i = 0; i < responses[0].ApiListData.APIdata[j].APIList[k].RequestMapping.fields.length; i++) {
            responses[0].ApiListData.APIdata[j].APIList[k].RequestMapping.fields = responses[0].ApiListData.APIdata[j].APIList[k].RequestMapping.fields.filter(function (item) {
              // console.log(responses[0].ApiListData.APIdata[j].RequestMapping.fields,">>>>> FIELDSSSSS")
              return (item.IN_FIELDDT !== 'array' && item.IN_FIELDDT !== 'object');
            });
          // }
        }
        //  console.log("********",responses[0].ApiListData.APIdata[j].RequestMapping.fields,"******");
      }
      // console.log("AFTER ------------- !!!!!!!!!!",JSON.stringify(responses[0].ApiListData.APIdata));
      for (let j = 0; j < responses[0].ApiListData.APIdata.length; j++) {
        for (let k = 0; k < responses[0].ApiListData.APIdata[j].APIList.length; k++) {
          for (let i = 0; i < responses[0].ApiListData.APIdata[j].APIList[k].RequestMapping.fields.length; i++) {
            if (responses[0].ApiListData.APIdata[j].APIList[k].RequestMapping.fields[i].IN_FIELDDT === 'number') {
              responses[0].ApiListData.APIdata[j].APIList[k].RequestMapping.fields[i].IN_FIELDDT = 'int64';
            }
            if (responses[0].ApiListData.APIdata[j].APIList[k].RequestMapping.fields[i].IN_FIELDDT === 'boolean') {
              responses[0].ApiListData.APIdata[j].APIList[k].RequestMapping.fields[i].IN_FIELDDT = 'bool';
            }
          }
        }
        // console.log("********",responses[0].ApiListData.APIdata[j].RequestMapping.fields,"******");
      }
      //  console.log("NEXT AFTER ----$$$$$$$$$$$$$$$$$$$$$$$$$44",JSON.stringify(responses[0].ApiListData))
      let DupIndex = [];

      function removeDuplicatesBy(comparator, array) {
        let unique = [];
        // console.log(array,"============== ARRAY")
        for (let i = 0; i < array.length; i++) {
          let isUnique = true;
          for (let j = 0; j < i; j++) {
            if (comparator(array[i], array[j])) {
              isUnique = false;
              DupIndex.push(i);
              break;
            }
          }
          if (isUnique)
            unique.push(array[i]);
        }
        // console.log(unique)
        return unique;
      }

      let uniqueMSP = removeDuplicatesBy(function (a, b) {
        return a.MSP === b.MSP;
      }, responses[0].ApiListData.APIdata);
      // console.log("unique : \n", uniqueMSP, "\n DupIndex :", DupIndex)
      for (let i = 0; i < DupIndex.length; i++) {
        // console.log(JSON.stringify(responses[0].ApiListData.APIdata[DupIndex[i]]), "++++++++++++ DUP INDEX DATA ")
        storeDuplicate.push(responses[0].ApiListData.APIdata[DupIndex[i]]);

      }
      // console.log(JSON.stringify(storeDuplicate), "diffRoutes-------------------")

      for (let m = 0; m < responses[0].ApiListData.APIdata.length; m++) {
        for (let k = 0; k < DupIndex.length; k++) {
          if (responses[0].ApiListData.APIdata[m].MSP == responses[0].ApiListData.APIdata[DupIndex[k]].MSP) {
            console.log()
            // console.log(responses[0].ApiListData.APIdata[DupIndex[k]].APIList[0],"NEW=====")
            // storeDuplicate.push(responses[0].ApiListData.APIdata[DupIndex[k]]);
            responses[0].ApiListData.APIdata[m].APIList.push(responses[0].ApiListData.APIdata[DupIndex[k]].APIList[0]);

          }
        }
      }
      responses[0].ApiListData.APIdata = uniqueMSP;




      // console.log(JSON.stringify(storeDuplicate), "%%%%%   STORE DUPLICATE")
      let commonRemove = checkCommon(storeDuplicate);
      function checkCommon(storeDuplicate) {
        console.log("INSIDE CHECKCOMMON")
        for (let i = 0; i < storeDuplicate[0].APIList.length; i++) {
          for (let j = 0; j < storeDuplicate[0].APIList.length; j++) {
            if (storeDuplicate[0].APIList[i] == storeDuplicate[0].APIList[j]) {
              console.log("  ***************88 SAME &&&&&&&&&&&&&&&&&&")
              delete storeDuplicate[0].APIList[j];
            }
          }
          return storeDuplicate
        }
      }

     
      function replaceM(fileData) {
        let getData = getFileIndex(fileData);
        // console.log("!!!!!! GET DATA------", getData, "----- !!!!!! GET DATA")
        let mData = getIndex(getData);
        let nData; let gData; let newData; let updatedfileData = "";
        for (let i = 0; i < responses[0].ApiListData.APIdata.length; i++) {
          nData = "";

          for (let k = 0; k < responses[0].ApiListData.APIdata[i].APIList.length; k++) {
            nData = "";
           
            {
              for (let j = 0; j < responses[0].ApiListData.APIdata[i].APIList[k].RequestMapping.fields.length; j++) {
                let getSlicedFieldName = responses[0].ApiListData.APIdata[i].APIList[k].RequestMapping.fields[j].IN_FIELD.split(".");

                // console.log("+++++", responses[0].ApiListData.APIdata[i].RequestMapping.fields[j].IN_FIELD);
                let updateField = getSlicedFieldName[1]
                if (updateField != undefined)
                  updateField = updateField.capitalize();

                gData = mData.replace('<<field1>>', updateField);
                gData = gData.replace('<<fieldType>>', responses[0].ApiListData.APIdata[i].APIList[k].RequestMapping.fields[j].IN_FIELDDT);
                let dataSplit = responses[0].ApiListData.APIdata[i].APIList[k].RequestMapping.fields[j].IN_FIELD.split('.');
                gData = gData.replace('<<field1JSON>>', dataSplit[1]);
                nData += gData + '\n'
                if (j === responses[0].ApiListData.APIdata[i].APIList[k].RequestMapping.fields.length - 1) {
                  // console.log(updatedfileData, ">>>>>>>>>>> -----at j-1 UPDATED FILE DATA")
                  updatedfileData += getData.replace(mData, nData);
                  // console.log(updatedfileData, ">>>>>>>>>>> -----at j-1 UPDATED FILE DATA")
                  updatedfileData = updatedfileData.replace('<<structName>>', responses[0].ApiListData.APIdata[i].APIList[k].route);
                  // 
                }

              }
            }
            // console.log(updatedfileData, ">>>>>>>>>>> ----- UPDATED FILE DATA")
          }

        }
        return updatedfileData;
        // console.log("%%%%%%%%",responses[0].ApiListData.APIdata,"%%%%%%%%5")

      }


      function getFileIndex(ifileData) {
        let startIndex = ifileData.search("type  ");
        let endIndex = ifileData.search(" }");
        let GetData = ifileData.substr(startIndex, endIndex);
        return GetData;
      }
      function getIndex(ifileData) {
        let startIndex = ifileData.search("<<field1>>");
        let endIndex = ifileData.search(" }");
        let GetData = ifileData.substring(startIndex, endIndex);
        return GetData;
      }

      fs.readFile(readfileFromPathStruct, 'utf8', function (err, fileData) {
        if (err) {
          return console.log(err);
        }
        console.log(responses[0].ApiListData.APIdata.length, ">>>>>>>>NEW LENGTH  ")
        let readUpdatedFile = replaceM(fileData, storeDuplicate);
        let getD = getFileIndex(fileData)
        let finalStructFile = fileData.replace(getD, readUpdatedFile)
        fs.writeFile(writefileToPathStruct, finalStructFile, 'utf8', function (err) {
          if (err) return console.log(err);

          // console.log(readUpdatedFile,"------->>>>>>>>>FILE DATE REPLACEm");
        });

      });


      //  console.log(JSON.stringify(responses[0].ApiListData.APIdata),"DATA --------------")

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
      let xData = "";
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

          for (let j = 0; j < responses[0].ApiListData.APIdata[i].APIList.length; j++) {
            {
              let gData = sData.replace(/<<FunctionName>>/g, responses[0].ApiListData.APIdata[i].APIList[j].route);
              // gData = gData.replace(/<<structName>>/g, responses[0].ApiListData.APIdata[i].APIList[j].route);

              fData = gData.replace(/<<FunctionDescription>>/g, responses[0].ApiListData.APIdata[i].APIList[j].purpose);

              tData = findIndex(fData);
              //console.log("&&&&&&&&",findIndexOfStruct(fData),"&&&&&&&&&");
              for (let k = 0; k <responses[0].ApiListData.APIdata[i].APIList[j].RequestMapping.fields.length; k++) {
                

                let getSlicedFieldName = responses[0].ApiListData.APIdata[i].APIList[j].RequestMapping.fields[k].IN_FIELD.split(".");
                
                let updateField = getSlicedFieldName[1]
                if (updateField != undefined)
                  updateField = updateField.capitalize();

                let hData = tData.replace('<<field>>', updateField);
                hData = hData.replace(/<<fieldType>>/g, responses[0].ApiListData.APIdata[i].APIList[j].RequestMapping.fields[k].IN_FIELDDT);
                hData = hData.replace('<<currentNo>>', k);

                fiData += hData + "\n";
               
                if (k === responses[0].ApiListData.APIdata[i].APIList[j].RequestMapping.fields.length - 1) {
                  // console.log("***********", fiData, "***********")
                  fData = fData.replace(tData, fiData);
                  // yData += fiData + "\n";
                  fiData = "";
                }
                
              }
              
              fData = fData.replace(/<<structName>>/g, responses[0].ApiListData.APIdata[i].APIList[j].route);

              fData = fData.replace(/<<getStructName>>/g, responses[0].ApiListData.APIdata[i].APIList[j].route);
              fData = fData.replace('<<field>>', 'BLANK');
              fData = fData.replace(/<<fieldType>>/g, 'string');
              fData = fData.replace('<<currentNo>>', '0');
            }
            // console.log("%%%%%%%%",responses[0].ApiListData.APIdata,"%%%%%%%%5")
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
        //console.log("%%%%%%%%",overWriteAgain,"%%%%%%%%5")
        let getFnLogicInd = findFnLogicIndex(fData);
        let Ldata = fData.replace(getFnLogicInd, overWrite);

        let getFnDescInd = findFnDescInd(fData);

        let hData = Ldata.replace(getFnDescInd, overWriteAgain);

        fs.writeFile(writefileToPath, hData, 'utf8', function (err) {
          if (err) return console.log(err);
          //  console.log(hData, "writeen !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        });
        //   // callback(hData, (responseCallback) => {

        //   //   responseCallback.set({
        //   //     'Content-Type': 'application/octet-stream',
        //   //     'Content-Disposition': 'attachment; filename=' + "PRChainCode.go"
        //   //   });
        //   // });
      });
      main();


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

async function diffPermissionsRoutes(payload, UUIDKey, route, callback, JWToken) {
  try {
    /*Querying on Permissions DB Table*/
    const permissions = await Permission.find({}).lean(true).exec();
    /*Querying on APIDefinition DB Table*/
    const aPIDefinition = await APIDefination.find({}).lean(true).exec();
    /*Comparison Function, takes two array larger array as first parameter and shows return the difference as array*/
    let finalRoutes = {};
    const compare = (array1, array2) => {
      return array1.filter(x => !array2.includes(x));
    };

    let data = [];
    const recursive = (object, resultObject, treeKey, dataKey) => {
      iterator(object[treeKey], resultObject, treeKey, dataKey);
    };
    /*Function to find the URIs from nth level of Object named children*/
    const iterator = (object, resultObject, treeKey, dataKey) => {
      for (let obj of object) {
        let hasData = obj[dataKey];
        if (hasData) {
          resultObject.push(hasData);
        }
        if (obj[treeKey]) {
          iterator(obj[treeKey], resultObject, treeKey, dataKey)
        }
      }
    };

    /*Fetching Routes from Permissions DB Table*/
    for (let perm of permissions) {
      recursive(perm, data, 'children', 'URI');
    }
    data = [].concat(...data);
    let finalRoutesFromPermissions = [];
    for (let route of data) {
      if (~route.indexOf('/')) {
        let routeArray = [];
        routeArray = route.split('/');
        let size = routeArray.length - 1;
        finalRoutesFromPermissions.push(routeArray[size] ==='' ? routeArray[size - 1]: routeArray[size]);
      } else {
        finalRoutesFromPermissions.push(route)
      }
    }
    let finalRoutesFromAPIDefination = [];
    /*Fetching Routes from APIDefinition DB Table*/
    for (let apiRoute of aPIDefinition) {
      finalRoutesFromAPIDefination.push(apiRoute.route);
    }

    /*Invoking comparison function on APIDefinition DB Table and Permissions DB Table*/
    finalRoutesFromAPIDefination.length <= finalRoutesFromPermissions.length ?
      finalRoutes.APIDefinationRoutes = compare(finalRoutesFromAPIDefination, finalRoutesFromPermissions):
      finalRoutes.APIDefinationRoutes = compare(finalRoutesFromPermissions, finalRoutesFromAPIDefination);


    /*Routes read from core routeConfiguration File*/
    let coreRoutes = fs.readFileSync(path.join(__dirname, '../../routeConfig/routeConfiguration.json'), 'utf8');
    coreRoutes = JSON.parse(coreRoutes);
    coreRoutes = [].concat(coreRoutes['core']);
    coreRoutes = coreRoutes.map((e)=> Object.keys(e));
    coreRoutes = [].concat(...coreRoutes);
    /*Invoking comparison function on Core routeConfiguration File and Permissions DB Table*/
    coreRoutes.length <= finalRoutesFromPermissions.length ?
      finalRoutes.coreRoutes = compare(coreRoutes, finalRoutesFromPermissions):
      finalRoutes.coreRoutes = compare(finalRoutesFromPermissions, coreRoutes);

    if (payload.application) {
      /*Routes read from Applications routeConfiguration File*/
      let applicationRoutes = fs.readFileSync(path.join(__dirname, '../../../applications/routeConfig/routeConfiguration.json'), 'utf8');
      applicationRoutes = JSON.parse(applicationRoutes);
      if (applicationRoutes[payload.application]) {
        applicationRoutes = [].concat(applicationRoutes[payload.application]);
        applicationRoutes = applicationRoutes.map((e) => typeof e === 'object' ? Object.keys(e) : null);
        applicationRoutes = [].concat(...applicationRoutes);
        /*Invoking comparison function on Applications routeConfiguration File and Permissions DB Table*/
        applicationRoutes.length <= finalRoutesFromPermissions.length ?
          finalRoutes.applicationRoutes = compare(applicationRoutes, finalRoutesFromPermissions) :
          finalRoutes.applicationRoutes = compare(finalRoutesFromPermissions, applicationRoutes);
      }
    }
    callback(finalRoutes);
  } catch (error) {
    console.log(error.stack)
  }
}

async function main() {
  await zipafolder.zip('./core/mappingFunctions/systemAPI/Chaincode', './core/mappingFunctions/systemAPI/Chaincode.zip');
}
exports.downloadChainCode = downloadChainCode;
exports.getAPIDefinition = getAPIDefinition;
exports.getAPIDefinitionID = getAPIDefinitionID;
exports.upsertAPIDefinition = upsertAPIDefinition;
exports.getServiceList = getServiceList;
exports.getActiveAPIList = getActiveAPIList;
exports.getActiveAPIListForDocumentation = getActiveAPIListForDocumentation;
exports.LoadConfig = LoadConfig;
exports.updateRequestStub = updateRequestStub;
exports.getActiveAPIs = getActiveAPIs;
exports.diffPermissionsRoutes = diffPermissionsRoutes;


