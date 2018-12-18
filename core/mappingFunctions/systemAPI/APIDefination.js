'use strict';
const APIDefinitation = require('../../../lib/repositories/apiDefination');
const _ = require('lodash');
const typeData = require('../../../lib/repositories/typeData');
const fs  = require('fs');
function updateRequestStub(payload, route, useCase) {
  let query = { 'sampleRequest': payload };
  APIDefinitation.update({ route: route, useCase: useCase }, query).then((data) => {
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
      let dest = data.useCase + "." + data.route;
      data.RequestMapping = data.RequestMapping.fields;
      data.ResponseMapping = data.ResponseMapping.fields;
      let groupedRoute = _.omit(data, 'route', 'useCase');
      _.set(routeConfig, dest, groupedRoute);
    });
    global.routeConfig = routeConfig;
    global.enumInfo = typeObj;
    return Promise.resolve();

  });
}
function getAPIDefinition(payload, UUIDKey, route, callback, JWToken) {
  APIDefinitation.findPageAndCount(payload).then((data) => {
    let actions = [
      {
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
      return APIDefinitation.update({ route: payload.route, useCase: payload.useCase }, payload).then((data) => {

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
      let reqMap = []
      data.RequestMapping.fields.forEach((field) => {
        if (field.IN_FIELDTYPE === "data" || field.IN_FIELDTYPE === "execFunctionOnData") {
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

let chainCodeData = [];
let responses = [];
function downloadChainCode(payload, UUIDKey, route, callback, JWToken) {
  console.log(payload, "IQRA");
  APIDefinitation.findPageAndCount(payload)
    .then((data) => {
      console.log(data)
      data[0].map(item => {
        if (item.isSmartContract == true && item.isActive == true) {
          chainCodeData.push({
            'isActive': item.isActive,
            'MSP': item.MSP,
            'description': item.description,
            'route': item.route,
            'useCase': item.useCase,
            'isSmartContract': item.isSmartContract
          });
        }
      });
      console.log(chainCodeData, "IQRAAAAAAAAAAAAAAAAAAAAAAAA")


      responses.push({
        ApiListData: {
          useCase: chainCodeData[0].useCase,
          APIdata: []
        }
      })
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
            ]
          }

          responses[0].ApiListData.APIdata.push(response)
        }

      }
      console.log(responses[0].ApiListData.APIdata)


      let DupIndex = []
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
        return a.MSP === b.MSP
      }, responses[0].ApiListData.APIdata);
      console.log("unique : \n", uniqueMSP, "\n DupIndex :", DupIndex)

      for (let m = 0; m < responses[0].ApiListData.APIdata.length; m++)
        for (let k = 0; k < DupIndex.length; k++) {
          if (responses[0].ApiListData.APIdata[m].MSP == responses[0].ApiListData.APIdata[DupIndex[k]].MSP) {
            responses[0].ApiListData.APIdata[m].APIList.push(responses[0].ApiListData.APIdata[DupIndex[k]].APIList[0])

          };
        }

      for (let i in DupIndex)
        console.log(responses[0].ApiListData.APIdata[DupIndex[i]].MSP)


      //Empty APIdata
      responses[0].ApiListData.APIdata.length = 0

      for (let m = 0; m < uniqueMSP.length; m++)
        responses[0].ApiListData.APIdata.push(uniqueMSP[m])
      console.log(JSON.stringify(responses))

      let updateIndex = "", newData = ""
      let mData = "", mData2 = "", mData3 = "", wData = "";
      let mData1 = ""
      function mspFunctionsLogic(data) {

        let funcLogicStart = data.search("//<<Function Validation Logic-Start>>");
        let funcLogicEnd = data.search("//<<Function Validation Logic - End>>")
        updateIndex = data.substring(funcLogicStart, funcLogicEnd);


        for (let i = 0; i < responses[0].ApiListData.APIdata.length; i++) {
          wData = ""

          if (i > 0) { newData = "\n" }
          newData += updateIndex.replace(/<<MSP>>/g, responses[0].ApiListData.APIdata[i].MSP)

          mData = newData.search("//<<FunctionCases-Start>>")
          mData2 = newData.search("//<<FunctionCases-End>>")
          mData3 = newData.substring(mData, mData2)

          for (let j = 0; j < responses[0].ApiListData.APIdata[i].APIList.length; j++) {

            wData += mData3.replace(/<<FunctionName>>/g, responses[0].ApiListData.APIdata[i].APIList[j].route)
            if (j == responses[0].ApiListData.APIdata[i].APIList.length - 1) {
              mData1 += newData.replace(mData3, wData)

              // if ( i != responses[0].ApiListData.APIdata.length - 1)
              // mData1 += '//<<Function Validation Logic - End>>\n else { \n' +
              //     'return shim.Error("Invalid MSP: " + org)\n' +
              //     '}\n'
              // '}\n'

            }
          }

        }
        return mData1

      }
      let xData = ""; let fData = ""
      function mspFunctionDesc(data) {
        for (let i = 0; i < responses[0].ApiListData.APIdata.length; i++) {

          let IndxFnDef = data.search("//<<FunctionDefinition - Start>>");
          let IndxFnDefEnd = data.search("//<<FunctionDefinition - End>>");
          let GetData = data.substring(IndxFnDef, IndxFnDefEnd);
          let sData = GetData.replace(/<<UseCase>>/g, responses[0].ApiListData.useCase)

          for (let j = 0; j < responses[0].ApiListData.APIdata[i].APIList.length; j++) {
            {
              let gData = sData.replace(/<<FunctionName>>/g, responses[0].ApiListData.APIdata[i].APIList[j].route)
              fData = gData.replace(/<<FunctionDescription>>/g, responses[0].ApiListData.APIdata[i].APIList[j].purpose)

            }

            xData += fData
          }
        }
        return xData
      }


      fs.readFile('test.txt', 'utf8', function (err, data) {
        if (err) {
          return console.log(err);

        }
        let fData = data.replace(/<<UseCase>>/g, responses[0].ApiListData.useCase)
        let ov = mspFunctionsLogic(data)
        let ovt = mspFunctionDesc(data)

        let funcLogicStart = fData.search("//<<Function Validation Logic-Start>>") //+ 38;
        let funcLogicEnd = fData.search("//<<Function Validation Logic - End>>")
        let nupdateIndex = fData.substring(funcLogicStart, funcLogicEnd);
        let Ldata = fData.replace(nupdateIndex, ov)

        let IndxFnDef = data.search("//<<FunctionDefinition - Start>>");
        let IndxFnDefEnd = data.search("//<<FunctionDefinition - End>>");
        let GetData = fData.substring(IndxFnDef, IndxFnDefEnd);
        let hData = Ldata.replace(GetData, ovt)

        fs.writeFile(responses[0].ApiListData.useCase + 'ChainCode.go', hData, 'utf8', function () {
          // app.get("/ApiList", function(req, res) {
          //   res.download('E:/git-repo/cipher_api/PRChainCode.txt')
          // })
        })
        // console.log(mData)
      });
      callback(responses);
    }).catch((err) => {
      console.log(err)
      console.log(JSON.stringify(err));
      for (let i = 0; i < chainCodeData.length; i++) {
        var response = {
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
        }
        // console.log(response)
      }
      callback(response);
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
