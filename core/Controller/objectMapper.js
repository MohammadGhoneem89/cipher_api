'use strict';
const _ = require('lodash');
const typeOf = require('typeof');
const casting = require('casting');
const customFunctions = require('../Common/customFunctions.js');
const validationFunctions = require('../Common/validationFunctions.js');

module.exports = class ObjectMapper {
  constructor(req, mappingConfig, typeData, UUID) {
    this.request = req;
    this.mappingConfig = mappingConfig;
    this.typeData = typeData;
    this.error = [];
    this.UUID = UUID;
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
      if (!value && element.IN_ISREQUIRED == "Y") {
        reject(`${element.IN_FIELD} is Required!`);
      }
      else if (value) {
        let isTypeMatch = this.DataTypeMatchCheck(element.IN_FIELDDT, value);
        if (isTypeMatch === false) {
          reject(`${element.IN_FIELD} type should be ${element.IN_FIELDDT}!`);
        }

        if (element.IN_FIELDTYPEDATA) {
          let tdObj = _.get(global.enumInfo, element.IN_FIELDTYPEDATA, null);
          if (tdObj) {
            tdObj.indexOf(value) === -1 ? reject(`${element.IN_FIELD} must only be a part of following set [${tdObj}] !`) : null;
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
        return this.CustomFunctionsExecution(data, this.request, element)
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
    return Promise.resolve(data);
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
  getHCV(tupple) {
    return new Promise((resolve, reject) => {
      resolve(tupple.IN_FIELDVALUE);
    });
  }
  start() {
    let promiseList = [];
    this.mappingConfig.forEach((element) => {
      if (element.IN_FIELDTYPE === 'data' || element.IN_FIELDTYPE === 'execFunctionOnData') {
        promiseList.push(this.validate(element));
      }
      else if (element.IN_FIELDTYPE === 'UUID') {
        promiseList.push(this.getUUID());
      }
      else if (element.IN_FIELDTYPE === 'HCV') {
        promiseList.push(this.getHCV(element));
      }
    });
    return Promise.all(promiseList).then((data) => {
      let fwdMessage = {};
      this.mappingConfig.forEach((element, index) => {
        _.set(fwdMessage, element.MAP_FIELD, data[index]);
      });
      return fwdMessage;
    });
  }
}
