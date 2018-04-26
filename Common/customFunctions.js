'use strict';

const _ = require('lodash');
const moment = require('moment');

function getDate(payload) {
  return new Date().toLocaleString();
}

function ConvertDateToISO(value) {
  if (value) {
    value = _getUnixDate(value);
  }
  return value.toString() || "";
}

function getHyphen(value) {
  return '000';
}

// TODO to be removed after replace epayMapping.json file with ConvertDateToISO
function ConvertCaptureDateDateToISO(payload) {
  return _getUnixDate(payload.TransactionCaptureDate);
}

function _getUnixDate(dateStr) {
  let unixDate = moment(dateStr, 'DD-MM-YYYY HH:mm:ss').valueOf() / 1000;
  return unixDate.toString();
}

function ArrayToString(value) {
  if (value) {
    return value.join();
  }
  return value;
}

function dataToString(value) {
  let retval = '';
  if (value) {
    retval = JSON.stringify(value);
  }

  if (retval === null) {
    retval = '';
  }
  return retval;
}

function actionTransform(str) {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function emptyToDash(value) {
  value = _.isEmpty(value) ? '-' : value;
  return value;
}

function consolidatedQuery(value) {
  return ["100"];
}

exports.actionTransform = actionTransform;
exports.getHyphen = getHyphen;
exports.getdate = getDate;
exports.dataToString = dataToString;
exports.ArrayToString = ArrayToString;
exports.ConvertDateToISO = ConvertDateToISO;
exports.ConvertCaptureDateDateToISO = ConvertCaptureDateDateToISO;
exports.emptyToDash = emptyToDash;
exports.consolidatedQuery = consolidatedQuery;

