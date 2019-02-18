'use strict';

const moment = require('moment');
const entityRepo = require('../lib/repositories/entity');

function validateTestFalse(value) {
  return false;
}

function bypass(value) {
  return true;
}

function required(value) {
  // TODO check typeof and value for the below
  if (value && value != '' && value != '-') {return true;} // eslint-disable-line
  return false;
}

function requiredArray(value) {
  // TODO fix this with _.isArray function
  if (value instanceof Array) {return true;}
  return true;
}

function validateAcqDate(date) {
  return moment(date, 'DD-MM-YYYY HH:mm:ss').isValid();
}

function validateDSGDate(date) {
  return moment(date, 'DD-MM-YYYY HH:mm:ss').isValid();
}

function validateEntityDate(date) {
  return moment(date, 'DD-MM-YYYY HH:mm:ss').isValid();
}

function validateSpCode(spCode) {
  return entityRepo.findOne({ spCode: spCode })
    .then((entity) => !!entity);
}


function validateStatus(data) {
   
    switch(data[0]){
      case "Reconciled":
                return true
      case "RECEIVED":
                return true
      case "Declined":
                return true
      case "Authorized":
                return true
      case "AUTHRECEIVED":
                return true
      case "Initiated":
                return true
      default:
                return false;
    }

}

function validateStatusAcq(data) {
   
    switch(data){
      case "declined":
                return true
      case "Authorized":
                return true
      default:
                return false;
    }

}

exports.bypass = bypass;
exports.required = required;
exports.requiredArray = requiredArray;
exports.validateSpCode = validateSpCode;
exports.validateDSGDate = validateDSGDate;
exports.validateAcqDate = validateAcqDate;
exports.validateTestFalse = validateTestFalse;
exports.validateEntityDate = validateEntityDate;
exports.validateStatus = validateStatus;
exports.validateStatusAcq=validateStatusAcq;
