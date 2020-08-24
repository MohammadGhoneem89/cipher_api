'use strict';
const _ = require('lodash');
const typeOf = require('typeof');
const casting = require('casting');
const customFunctions = require('../Common/customFunctions.js');
const validationFunctions = require('../Common/_validationFunctions.js');

module.exports = class ObjectMapper {
  constructor(req, mappingConfig, typeData, UUID, JWToken, mappingType, transformations) {
    this.request = req;
    this.mappingConfig = mappingConfig;
    this.typeData = typeData;
    this.error = [];
    this.UUID = UUID;
    this.mappingType = mappingType;
    this.JWToken = JWToken;
    this.transformations = transformations;
  }
  DataTypeMatchCheck(type, value) {
    if (typeOf(value) === type) {
      return true;
    }
    return false;
  }
  validate(element) {
    return new Promise((resolve, reject) => {
      let value = _.get(this.request, element.IN_FIELD, null);
      if (value !== false && !value && element.IN_ISREQUIRED == "Y") {
        reject(`${element.IN_FIELD} is Required!`);
      }
      else if (value === false || value) {
        let isTypeMatch = this.DataTypeMatchCheck(element.IN_FIELDDT, value);
        if (isTypeMatch === false && element.IN_ISREQUIRED == "Y") {
          reject(`${element.IN_FIELD} type should be ${element.IN_FIELDDT}!`);
        }

        if (element.IN_FIELDTYPEDATA) {
          let tdObj = _.get(global.enumInfo, `${element.IN_FIELDTYPEDATA}.key`, null);
          let tdObjVal = _.get(global.enumInfo, `${element.IN_FIELDTYPEDATA}.value`, null);
          if (tdObj) {
            let index = tdObj.indexOf(value);
            if (index === -1)
             return reject(`${element.IN_FIELD} must only be a part of following set [${tdObj}] !`)
            return resolve(tdObjVal[index]);
          }
          else {
            reject(`${element.IN_FIELD} for field Enumeration not found Enum ID [${element.IN_FIELDTYPEDATA}] !`);
          }
        }
      }
      this.CustomValidationCheck(element.IN_FIELDVALIDATION, element).then((result) => {
        if (result && result.error === true) {
          if (result.message) {
            reject(result.message);
          }
          else {
            reject(`${element.IN_FIELD} Custom validation Failed!`);
          }
        }
        return result;
      }).then((data) => {
        try {
          if (value !== false && !value) {
            return undefined;
          }
          let CastedValue = casting.cast(element.MAP_FIELDDT, value);
          if (element.MAP_FIELDDT === 'number' && isNaN(CastedValue)) {
            reject(`${element.IN_FIELD} unable to cast field to ${element.MAP_FIELDDT}!`);
          }
          else {
            return CastedValue;
          }
        }
        catch (ex) {
          reject(`${element.IN_FIELD} unable to cast field to ${element.MAP_FIELDDT}!`);
        }
      }).then((data) => {
        let rese= this.CustomFunctionsExecution(data, this.request, element);
          _.set(this.request,"processedPayload."+_.get(element,"IN_FIELD",""),rese)
           return rese;
      }).then((data) => {
        resolve(data);
      }).catch((exp) => {
        console.log(`Custom Validation Failed for Field ${element.IN_FIELD}`);
        console.log(`ERROR: ${exp}`);
        reject(exp);
      });
    });
  }
  CustomFunctionsExecution(data, payload, config) {
    if (customFunctions[config.IN_FIELDFUNCTION] instanceof Function) {
      return customFunctions[config.IN_FIELDFUNCTION](data, payload, this.JWToken, config);
    }
    throw new Error(`${config.IN_FIELDFUNCTION} is not found locally!`)
  }
  CustomFunctionsExecutionPostProcessing(functionName, data, payload) {
    if (customFunctions[functionName] instanceof Function) {

      return customFunctions[functionName](data, payload, this.JWToken);
    }
    throw new Error(`${functionName} is not found locally!`);
  }
  CustomValidationCheck(functionName, data) {
    let response = { 'error': false };
    return Promise.resolve(response);
  }
  getUUID() {
    return new Promise((resolve, reject) => {
      resolve(this.UUID);
    });
  }
  getOrg() {
    return new Promise((resolve, reject) => {
      let org = _.get(this.request, '__JWTORG', "");
      if (org) {
        resolve(org);
      }
      else {
        reject('JWT orgCode is not defined, please authenticate or check configuration!!');
      }
    });
  }
  getHCV(tupple) {
    return new Promise((resolve, reject) => {
      resolve(tupple.IN_FIELDVALUE);
    });
  }
  start() {
    let promiseList = [];
    this.mappingConfig.forEach((element) => {
      if (element.IN_FIELDTYPE === 'data' || element.IN_FIELDTYPE === 'execFunctionOnData' || element.IN_FIELDTYPE === 'OrgIdentifier') {
        promiseList.push(this.validate(element));
      }
      else if (element.IN_FIELDTYPE === 'JWTORG') {
        promiseList.push(this.getOrg());
      }
      else if (element.IN_FIELDTYPE === 'UUID') {
        promiseList.push(this.getUUID());
      }
      else if (element.IN_FIELDTYPE === 'HCV') {
        if (element.IN_FIELDDT == 'boolean') {
          element.IN_FIELDVALUE = true;
        }
        promiseList.push(this.getHCV(element));
      }
    });
    return Promise.all(promiseList).then((data) => {
      let fwdMessage = {};

      this.mappingConfig.forEach((element, index) => {

        if (element.IN_FIELDDT == 'string' && element.MAP_FIELDDT == 'array' && element.IN_FIELDTYPE === 'JWTORG') {
          //  execute rules and update JSON
          let settingArray = _.get(fwdMessage, element.MAP_FIELD, []);
          let fieldData = "";
          fieldData = data && data[index];
          settingArray.push(fieldData);
          _.set(fwdMessage, element.MAP_FIELD, settingArray);
        }
        else if (element.IN_FIELDDT == 'string' && element.MAP_FIELDDT == 'array') {
          //  execute rules and update JSON
          let settingArray = _.get(fwdMessage, element.MAP_FIELD, []);
          let fieldData = "";
          if (data[index] instanceof Array) {
            fieldData = data && data[index] && data[index][0] ? data[index][0] : "";
          }
          else {
            fieldData = String(data && data[index] && data[index] ? data[index] : "");
          }
          settingArray.push(fieldData);
          _.set(fwdMessage, element.MAP_FIELD, settingArray);
        }
        else if ((element.IN_FIELDDT == 'number' || element.IN_FIELDDT == 'boolean') && element.MAP_FIELDDT == 'array') {
          //  execute rules and update JSON
          let settingArray = _.get(fwdMessage, element.MAP_FIELD, []);
          let fieldData = "";
          fieldData = data && data[index] && data[index][0] ? data[index][0] : "";
          settingArray.push(String(fieldData));
          _.set(fwdMessage, element.MAP_FIELD, settingArray);
        }
        else if (element.IN_FIELDDT == 'object' && element.MAP_FIELDDT == 'array') {
          //  execute rules and update JSON

          let settingArray = _.get(fwdMessage, element.MAP_FIELD, []);
          let fieldData = "";

          fieldData = data && data[index] && data[index][0] ? data[index][0] : data[index];
          // console.log(">>>>>>>>>>>>>>>>>>>>>ipopo", this.mappingType, JSON.stringify(data[index]));
          let stringObj = JSON.stringify(fieldData);
          settingArray.push(stringObj);
          _.set(fwdMessage, element.MAP_FIELD, settingArray);

        }
        else if (element.IN_FIELDDT == 'array' && element.MAP_FIELDDT == 'array' && this.mappingType == 'Request') {
          //  execute rules and update JSON
          let settingArray = _.get(fwdMessage, element.MAP_FIELD, []);
          let fieldData = "";
          fieldData = data && data[index] && data[index] ? data[index] : [];
          let stringObj = JSON.stringify(fieldData);
          settingArray.push(stringObj);
          _.set(fwdMessage, element.MAP_FIELD, settingArray);
        }
        else {
          _.set(fwdMessage, element.MAP_FIELD, data[index]);
        }
      });
      return fwdMessage;
    }).then((message) => {
      try {
        this.transformations && this.transformations.forEach((data) => {
          let elem;
          switch (data.TRAN_FIELDTYPE) {
            case "delete":
              _.set(message, data.TRG_FIELD, undefined);
              break;
            case "marshall":
              elem = _.get(message, data.TRG_FIELD, undefined);
              _.set(message, data.TRG_FIELD, undefined);
              _.set(message, data.TRAN_FIELD, JSON.stringify(elem));
              break;
            case "unmarshall":
              elem = _.get(message, data.TRG_FIELD, undefined);
              _.set(message, data.TRG_FIELD, undefined);
              _.set(message, data.TRAN_FIELD, JSON.parse(elem));
              break;
            case "deleteFromArray":
              let list = _.get(message, data.TRG_FIELD, []);
              _.set(message, data.TRG_FIELD, undefined);
              if (list instanceof Array) {
                list.forEach((e, index) => {
                  _.set(e, data.TRAN_FIELD, undefined);
                });
              }
              _.set(message, data.TRAN_FIELD, list);
              break;
            case "mapTypedata":
              console.log("mapTypedata to be implemented!!!!!");
              break;
            case "rename":
              elem = _.get(message, data.TRG_FIELD, undefined);
              _.set(message, data.TRG_FIELD, undefined);
              _.set(message, data.TRAN_FIELD, elem);
              break;
            default:
              break;
          }
          elem = _.get(message, data.TRG_FIELD, '');
          if (data.TRAN_FIELDFUNCTION !== 'STUB') {
            _.set(message, data.TRG_FIELD, undefined);
            let result = this.CustomFunctionsExecutionPostProcessing(data.TRAN_FIELDFUNCTION, elem, message);
            result && _.set(message, data.TRAN_FIELD, result);
          };
        });
        return message;
      }
      catch (ex) {
        return Promise.reject(ex.message);
      }
    });
  }
};
