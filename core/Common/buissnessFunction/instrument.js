'use strict';

const _ = require('lodash');
const moment = require('moment');
const dates = require('../../../lib/helpers/dates');
module.exports = {
  validateInstrument: (data, payload, jwt) => {
    if (!(data instanceof Array)) {
      throw new Error("Instrumentation Field(s) missing");
    }
    data.forEach((element, index) => {
      if (!element.bankCode || !element.paymentMethod || !element.date || !element.amount) {
        throw new Error(`Mandotary Field(s) missing from array on index ${index}`);
      }
      element.date = dates.ddMMyyyyslash(element.date);
      element.amount = parseFloat(element.amount) || 0;
      element.providerMetaData = element.providerMetaData ? JSON.stringify(element.providerMetaData) : undefined;
      element.bankMetaData = element.bankMetaData ? JSON.stringify(element.bankMetaData) : undefined;
      element.beneficiaryData = element.beneficiaryData ? JSON.stringify(element.beneficiaryData) : undefined;
    });
    return data;
  },
  validateInstrumentObject: (data, payload, jwt) => {
    data.date = dates.ddMMyyyyslash(data.date);
    data.amount = parseFloat(data.amount) || 0;
    data.providerMetaData = data.providerMetaData ? JSON.stringify(data.providerMetaData) : undefined;
    data.bankMetaData = data.bankMetaData ? JSON.stringify(data.bankMetaData) : undefined;
    data.beneficiaryData = data.beneficiaryData ? JSON.stringify(data.beneficiaryData) : undefined;
    return data;
  }

};
