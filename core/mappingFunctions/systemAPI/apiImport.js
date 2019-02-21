'use strict';
const excelToJson = require('convert-excel-to-json');
const APIDefinitation = require('../../../lib/repositories/apiDefination');
const api = require('./APIDefination.js');
const _ = require('lodash');
const typeData = require('../../../lib/repositories/typeData');
const fs = require('fs');
let flatten = require('flat');
const MappingConfig = require('../../../lib/repositories/mappingConfig');
function upsertAPIImport(payload, UUIDKey, route, callback, JWToken) {
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
  let payloadMapping = {
    mappingName: payload.mappingNameRequest,
    mappingType: "REQUEST",
    useCase: payload.useCase,
    description: payload.description,
    fields: payload.requestMapping,
    transformations: [],
    createdBy: JWToken._id
  };
  let payloadResponseMapping = {
    mappingName: payload.mappingNameResponse,
    mappingType: "RESPONSE",
    useCase: payload.useCase,
    description: payload.description,
    fields: payload.responseMapping,
    transformations: [],
    createdBy: JWToken._id
  };
  let promises = [
    MappingConfig.deleteAndInsert({
      mappingName: payload.mappingNameRequest
    }, payloadMapping),
    MappingConfig.deleteAndInsert({
      mappingName: payload.mappingNameResponse
    }, payloadResponseMapping)
  ];
  payload.typedata.forEach((elm) => {
    promises.push(typeData.deleteAndInsert({ typeName: elm.typeName }, elm))
  });
  Promise.all(promises).then((data) => {
    console.log("Record Updated Success, for Request / Response Mapping!!!");
    let requestMappingId = data[0]._id;
    let responseMappingId = data[1]._id
    let request = {
      "route": payload.route,
      "useCase": payload.useCase,
      "isSmartContract": true,
      "CustomMappingFile": " ",
      "MappingfunctionName": " ",
      "RequestMapping": requestMappingId,
      "ResponseMapping": responseMappingId,
      "authorization": "Basic Auth",
      "communicationMode": "QUEUE",
      "description": payload.description,
      "isActive": true,
      "isAsync": false,
      "isCustomMapping": false,
      "isRouteOveride": false,
      "isSimulated": true,
      "isValBypass": false,
      "requestServiceQueue": "BLA_Input_Queue",
      "responseQueue": "UI_Input_Queue",
      "simulatorResponse": "{\n                    \"messageStatus\": \"OK\",\n                    \"errorCode\": 200,\n                    \"errorDescription\": \"\",\n                    \"cipherMessageId\": \"c0a43490-df3f-11e7-a27c-4beb2ae22916\",\n                    \"timestamp\": \"22/09/2018 22:24:16.000\"\n}",
      "simucases": [
        {
          "SimulatorResponse": JSON.stringify(payload.sampleResJSON) || "{ \"messageStatus\":\"OK\", \"errorCode\":200, \"errorDescription\":\"\", \"cipherMessageId\":\"c0a43490-df3f-11e7-a27c-4beb2ae22916\", \"timestamp\":\"22/09/2018 22:24:16.000\"}",
          "SimuValue": "*",
          "SimuField": "*",
          "RuleName": "general",
          "actions": [
            {
              "label": "Delete",
              "iconName": "fa fa-trash",
              "actionType": "COMPONENT_FUNCTION"
            },
            {
              "label": "Edit",
              "iconName": "fa fa-edit",
              "actionType": "COMPONENT_FUNCTION"
            }
          ]
        }
      ],
      "isResValBypass": false,
      "sampleRequest": payload.sampleReqJSON,
      "isBlockchain": false
    };
    return APIDefinitation.deleteAndInsert({
      "route": payload.route,
      "useCase": payload.useCase
    }, request).then((apiUpdatedata) => {
      console.log("Record Updated Success, for API Mapping!!!");
      return apiUpdatedata;
    });
  }).then((data) => {
    resp.responseMessage.data.message.status = "OK";
    data.nModified > 0 ?
      resp.responseMessage.data.message.errorDescription = "Record Updated Success!!" :
      resp.responseMessage.data.message.errorDescription = "Record Inserted Successfully!!";
    resp.responseMessage.data.message.newPageURL = "/ApiList";
    api.LoadConfig().then(() => {
      console.log('Configurations Loaded For Request Processing!!');
    });
    callback(resp);
  }).catch((err) => {
    console.log(err);
    return callback(resp);
  });
}

function getImport(payload, UUIDKey, route, callback, JWToken) {
  let data = parseAndProcess(payload);
  callback(data);
}

function parseAndProcess(payload) {
  const result = excelToJson({
    sourceFile: payload.path
  });
  let mapping = [];
  let typedata = [];
  let sampleJSONType = {}
  let sampleJSON = {}
  let sampleJSONArray = [];
  let fields = result.cipher;
  let objectList = [];
  let lastComplexTypes = "";
  let objectTypeList = {
    keys: [],
    types: []
  };
  for (let key in result.cipher) {
    let typeName = "";
    if (key != "0") {
      let data = fields[key];
      let attributes = _.get(data, 'A', undefined);
      let type = _.get(data, 'B', undefined);
      let _default = _.get(data, 'C', undefined);
      let required = _.get(data, 'D', undefined);
      let enumerations = _.get(data, 'E', undefined);
      let description = _.get(data, 'F', undefined);
      if (enumerations) {
        let tdList = enumerations.split(',');
        let rows = [];
        tdList.forEach((elm) => {
          let apiTupple = {
            "label": elm,
            "value": elm
          };
          rows.push(apiTupple);
        });
        typeName = attributes.toUpperCase().replace(".", "_");
        let typedataTemplate = {
          "typeName": `${typeName}_AGEN`,
          "data": {
            [`${typeName}_AGEN`]: rows
          }
        };
        typedata.push(typedataTemplate);
      }
      if (attributes && type) {
        let flag = -1;
        let isKey = false;
        let refrenceObj;
        let isSubData = false;
        // type subdata
        if (flag < 0 && type.indexOf(lastComplexTypes) > -1) {
          isSubData = true;
        }

        // string
        flag = (flag < 0 && type.indexOf("string") > -1 && type.indexOf("array") < 0) ? 0 : flag;
        // string array
        flag = (flag < 0 && type.indexOf("string") > -1 && type.indexOf("array") > -1) ? 1 : flag;

        // type 
        let complexType = "";
        if (flag < 0 && type.indexOf("type") > -1) {
          flag = 3;
          let x = type.split(" ");
          if (x instanceof Array) {
            complexType = x[1];
          }
          if (type.indexOf("array") > -1) {
            flag = 33;
          }

        }
        if (flag < 0 && type.indexOf("object") > -1 && type.indexOf("array") > -1) {
          flag = 44;
        }
        if (flag < 0 && type.indexOf("object") > -1) {
          flag = 4;
        }
        // array
        flag = (flag < 0 && type.indexOf("array") > -1) ? 2 : flag;
        // string array
        flag = (flag < 0 && type.indexOf("date") > -1) ? 5 : flag;
        // integer
        flag = (flag < 0 &&
          (
            type.indexOf("integer") > -1 || type.indexOf("number") > -1
            || type.indexOf("float64") > -1
          )
        ) ? 6 : flag;

        flag = (flag < 0 && type.indexOf("array") > -1 &&
          (
            type.indexOf("integer") > -1
            || type.indexOf("number") > -1
            || type.indexOf("float64") > -1
          )
        ) ? 7 : flag;

        // boolean
        flag = (flag < 0 && ((type.indexOf("boolean") > -1) || type.indexOf("bool") > -1)) ? 8 : flag;
        // string array
        isKey = (flag < 0 && type.indexOf("KEY") > -1);

        let format = /\(([^)]+)\)/;
        let matches = format.exec(type);
        let length = 0;
        if (matches) {
          length = matches[0];
          length = length.replace('(', '').replace(')', '');
        }
        let requireVal = "N";
        if (required) {
          requireVal = required == "Y" || required == "y" || required == "1" || required == "true" || required == "TRUE" ? "Y" : "N";
        }
        let seq = parseFloat(key);
        let mappingConfig = {
          "Sequence": seq,
          "IN_FIELD": `body.${attributes}`,
          "IN_FIELDVALUE": "",
          "IN_FIELDTYPE": "data",
          "IN_FIELDDT": "string",
          "IN_FIELDFUNCTION": "STUB",
          "IN_FORMAT": length,
          "IN_COMPLEXTYPE": complexType,
          "IN_FIELDVALIDATION": "bypass",
          "IN_FIELDDESCRIPTION": description || "",
          "IN_ISREQUIRED": requireVal,
          "MAP_FIELD": "Body.arguments",
          "MAP_FIELDDT": "array",
          "IN_FIELDTYPEDATA": typeName
        };
        let obj;
        obj = sampleJSON;
        switch (flag) {
          case 0:
            _.set(obj, attributes, String(_default));
            break;
          case 1:
            _.set(obj, attributes, String(_default));
            sampleJSONArray.push(attributes);
            break;
          case 5:
            _.set(obj, attributes, String(_default));
            mappingConfig.IN_FIELDTYPE = "data";
            break;
          case 2:
            _.set(obj, attributes, String(_default));
            mappingConfig.IN_FIELDDT = "array";
            sampleJSONArray.push(attributes);
            break;
          case 6:
            mappingConfig.IN_FIELDDT = "numeric";
            _.set(obj, attributes, parseFloat(_default));
            break;
          case 7:
            mappingConfig.IN_FIELDDT = "array";
            _.set(obj, attributes, parseFloat(_default));
            sampleJSONArray.push(attributes);
            break;
          case 8:
            mappingConfig.IN_FIELDDT = "boolean";
            let bool = false;
            if (_default == "TRUE" || _default == "true" || _default == "Y") {
              bool = true;
            }
            _.set(obj, attributes, bool);
            break;
          case 3:
            mappingConfig.IN_FIELDDT = "object";
            objectList.push(attributes);
            _.set(obj, attributes, {});
            break;
          case 33:
            mappingConfig.IN_FIELDDT = "array";
            objectList.push(attributes);
            _.set(obj, attributes, {});
            break;
          case 4:
            objectList.push(attributes);
            _.set(obj, attributes, {});
            mappingConfig.IN_FIELDDT = "object";
            break;
          case 44:
            objectList.push(attributes);
            sampleJSONArray.push(attributes);
            _.set(obj, attributes, {});
            mappingConfig.IN_FIELDDT = "array";
            break;
          default:
            console.log(`ignoring attribute due to bad type ${attributes}`);
            // _.set(sampleJSON, attributes, String(_default));
            break;
        }
        let flagChangeMap = false;
        if (!(flag === 4 || flag === 44 || flag === 3 || flag === 33) && attributes.indexOf(".") > -1) {
          objectList.forEach((elem) => {

            if (attributes.indexOf(elem) > -1) {
              flagChangeMap = true;
            }

          });
          mappingConfig.MAP_FIELD = flagChangeMap === true ? "Body.ignored" : mappingConfig.MAP_FIELD;
        }
        console.log(`ignoring attribute due to bad type ${attributes}>>>>>>>>>>>>>>>>>>>>>${flagChangeMap}>>>>>>>>>>>>>>>${complexType}>>>>>>>>>${type}>>>>>${flag}`);

        // console.log(`ignoring attribute due to bad type ${JSON.stringify(objectList)}`);
        if (flag > -1 && flagChangeMap === false)
          mapping.push(mappingConfig);
      }
      else {
        console.log(`Parsing failed on line no ${key}`);
      }
    }
  }

  objectTypeList.keys.forEach((elm, index) => {
    let type = objectTypeList.types[index]
    let refObj = _.get(sampleJSON, type, undefined);
    _.set(sampleJSON, elm, refObj);
  });

  // let newSample = _.cloneDeep(sampleJSON);
  // attribList.forEach((element) => {
  //   _.set(newSample, element, undefined);
  // });

  // let flattenOut = flatten(newSample, { maxDepth: 3 })
  // let finalMapping = [];
  // for (const prop in flattenOut) {
  //   mapping.forEach((element) => {
  //     console.log(prop)
  //     if (element.IN_FIELD === `body.${prop}`) {
  //       finalMapping.push(element);
  //     }
  //   });
  // }

  sampleJSONArray.forEach((element) => {
    let tupple = _.get(sampleJSON, element, undefined);
    if (typeof tupple === 'string' || tupple instanceof String) {
      _.set(sampleJSON, element, []);
    } else {
      _.set(sampleJSON, element, [tupple]);
    }
  });

  // console.log(JSON.stringify(sampleJSON));
  // console.log(JSON.stringify(mapping, null, 2));

  return {
    "ApiImport": {
      "action": "ApiImport",
      "data": {
        mapping: mapping,
        typedata,
        sampleJSON: {
          body: sampleJSON
        }
      }
    }
  };
}

exports.getImport = getImport;
exports.upsertAPIImport = upsertAPIImport;
