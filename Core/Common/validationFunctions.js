'use strict';

function validateTestFalse(value) {
  return false;
}

function bypass(value) {
  return true;
}

function required(value) {
  if (value && value !== '' && value !== '-') {return true;} // eslint-disable-line
  return false;
}

function requiredArray(value) {
  if (value instanceof Array) {return true;}
  return true;
}

exports.bypass = bypass;
exports.required = required;
exports.requiredArray = requiredArray;
exports.validateTestFalse = validateTestFalse;