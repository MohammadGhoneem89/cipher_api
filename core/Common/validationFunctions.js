'use strict';
let validator = require('validator');
let validatorFunc= {
  isEmail: validator.isEmail,
  isURL: validator.isURL,
  isMACAddress: validator.isMACAddress,
  isIP: validator.isIP,
  isFQDN: validator.isFQDN,
  isBoolean: validator.isBoolean,
  isAlpha: validator.isAlpha,
  isAlphanumeric: validator.isAlphanumeric,
  isNumeric: validator.isNumeric,
  isPort: validator.isPort,
  isLowercase: validator.isLowercase,
  isUppercase: validator.isUppercase,
  isAscii: validator.isAscii,
  isInt: validator.isInt,
  isFloat: validator.isFloat,
  isDecimal: validator.isDecimal,
  isHexadecimal: validator.isHexadecimal,
  isHexColor: validator.isHexColor,
  isISRC: validator.isISRC,
  isMD5: validator.isMD5,
  isHash: validator.isHash,
  isJSON: validator.isJSON,
  isEmpty: validator.default,
  isByteLength: validator.isByteLength,
  isUUID: validator.isUUID,
  isMongoId: validator.isMongoId,
  isCreditCard: validator.isCreditCard,
  isISIN: validator.isISIN,
  isISBN: validator.isISBN,
  isISSN: validator.isISSN,
  isMobilePhone: validator.isMobilePhone,
  isPostalCode: validator.isPostalCode,
  isCurrency: validator.isCurrency,
  isISO8601: validator.isISO8601,
  isISO31661Alpha2: validator.isISO31661Alpha2,
  isBase64: validator.isBase64,
  isDataURI: validator.isDataURI,
  isMimeType: validator.isMimeType,
  isLatLong: validator.isLatLong,
};
module.exports = {
  bypass: (value) => {
    return true;
  },
  validateTestFalse: (value) => {
    return new Promise((resr, rej) => {
      return rej();
    });
  },
  required: (value) => {
    if (value && value !== '' && value !== '-') { return true; } // eslint-disable-line
    return false;
  },
  requiredArray: (value) => {
    if (value instanceof Array) { return true; }
    return true;
  },
  ...validatorFunc
}
