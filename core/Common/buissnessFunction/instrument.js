'use strict';

const _ = require('lodash');
const moment = require('moment');
const dates = require('../../../lib/helpers/dates');
module.exports = {
  jsonParseNoError: (data, payload, jwt) => {
    try {
      return JSON.parse(data);
    } catch (ex) {
      console.log(ex);
      return {}
    }
  },
  GetContractData,
  validateInstrumentObject: (data, payload, jwt) => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>." + JSON.stringify(data))
    data.forEach((element, index) => {
      element.date = dates.ddMMyyyyslash(element.date);
      element.amount = parseFloat(element.amount) || 0;
      element.providerMetaData = element.providerMetaData ? JSON.stringify(element.providerMetaData) : undefined;
      element.bankMetaData = element.bankMetaData ? JSON.stringify(element.bankMetaData) : undefined;
      element.beneficiaryData = element.beneficiaryData ? JSON.stringify(element.beneficiaryData) : undefined;
    });
    return data;
  },
  translateInstrumentArray: (data, payload, jwt) => {
    try {
      let result = JSON.parse(data);
      let startDate = _.get(result, "contractStartDate", undefined);
      let EndDate = _.get(result, "contractEndDate", undefined);
      result.contractStartDate = startDate >= 0 ? dates.MSddMMyyyyHHmmS(startDate) : undefined;
      result.contractEndDate = EndDate >= 0 ? dates.MSddMMyyyyHHmmS(EndDate) : undefined;
      result.paymentInstruments.forEach((element, index) => {
        element.date = dates.MSddMMyyyyHHmmS(element.date);
        element.amount = String(element.amount) || "0";
        element.providerMetaData = element.providerMetaData ? JSON.parse(element.providerMetaData) : undefined;
        element.bankMetaData = element.bankMetaData ? JSON.parse(element.bankMetaData) : undefined;
        element.beneficiaryData = element.beneficiaryData ? JSON.parse(element.beneficiaryData) : undefined;
      });
      return result;

    } catch (ex) {
      console.log(ex);
      return jsonParseNoError(data, payload, jwt);
    }
  },
  translateIntrumentArrayWithoutIIP: (data, payload, jwt) => {
    try {
      let result = JSON.parse(data);
      let startDate = _.get(result, "contractStartDate", undefined);
      let EndDate = _.get(result, "contractEndDate", undefined);
      result.contractStartDate = startDate >= 0 ? dates.MSddMMyyyyHHmmS(startDate) : undefined;
      result.contractEndDate = EndDate >= 0 ? dates.MSddMMyyyyHHmmS(EndDate) : undefined;

      result.paymentInstruments.forEach((element, index) => {
        element.date = dates.MSddMMyyyyHHmmS(element.date);
        element.amount = String(element.amount) || "0";
        element.providerMetaData = element.providerMetaData ? JSON.parse(element.providerMetaData) : undefined;
        element.bankMetaData = element.bankMetaData ? JSON.parse(element.bankMetaData) : undefined;
        element.beneficiaryData = element.beneficiaryData ? JSON.parse(element.beneficiaryData) : undefined;
      });
      _.set(result,'instrumentList',undefined);
      return result;

    } catch (ex) {
      console.log(ex);
      return jsonParseNoError(data, payload, jwt);
    }
  }

};
function jsonParseNoError(data, payload, jwt) {
  try {
    return JSON.parse(data);
  }
  catch (ex) {
    // console.log(ex);
    return {}
  }
}
