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

    data = _.orderBy(data, ['date'], ['asc']);
    return data;
  },
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
  ParseContractDataForPM: (data, payload, jwt) => {
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

        _.set(element, 'contractID', undefined);
        _.set(element, 'documentName', undefined);
        _.set(element, 'key', undefined);
        _.set(element, 'failureReason', undefined);
      });
      
      _.set(result, 'documentName', undefined);
      _.set(result, 'key', undefined);
      _.set(result, 'EIDA', undefined);
      _.set(result, 'instrumentList', undefined);
      _.set(result, 'instrumentDetail', undefined);
      _.set(result, 'checkKYCStatus', undefined);
      _.set(result, 'contractSignedHash', undefined);
      _.set(result, 'CRMTicketNo', undefined);
      _.set(result, 'ejariData.contractID', undefined);
      _.set(result, 'terminationDate', undefined);
      _.set(result, 'terminationReason', undefined);
      _.set(result, 'tranDate', undefined);

      return result;

    } catch (ex) {
      console.log(ex);
      return jsonParseNoError(data, payload, jwt);
    }
  },

  ParseContractDataForBank: (data, payload, jwt) => {
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

        _.set(element, 'contractID', undefined);
        _.set(element, 'documentName', undefined);
        _.set(element, 'key', undefined);
        _.set(element, 'failureReason', undefined);

        _.set(element, 'cancellationReason', undefined);
        _.set(element, 'replacementReason', undefined);
        _.set(element, 'newInstrumentRefNo', undefined);
        _.set(element, 'oldInstrumentRefNo', undefined);
        _.set(element, 'failureDescription', undefined);
        _.set(element, 'beneficiaryData', undefined);
      });
        
      _.set(result, 'documentName', undefined);
      _.set(result, 'key', undefined);
      _.set(result, 'instrumentList', undefined);
      _.set(result, 'instrumentDetail', undefined);
      _.set(result, 'checkKYCStatus', undefined);
      _.set(result, 'contractSignedHash', undefined);
      _.set(result, 'CRMTicketNo', undefined);
      _.set(result, 'ejariData.contractID', undefined);
      _.set(result, 'terminationDate', undefined);
      _.set(result, 'terminationReason', undefined);
      _.set(result, 'tranDate', undefined);
      _.set(result, 'ejariData', undefined);

      return result;

    } catch (ex) {
      console.log(ex);
      return jsonParseNoError(data, payload, jwt);
    }
  },

  ParseContractDataForEjari: (data, payload, jwt) => {
    let contract = {
      "contractID": "",
      "contractAmount": "",
      "contractStartDate": "",
      "contractEndDate": "",
      "oldEjariNumber": "",
      "paymentCount": "",
      "userReferenceNo": "",
    }

    try {
      let result = JSON.parse(data);
      let startDate = _.get(result, "contractStartDate", undefined);
      let EndDate = _.get(result, "contractEndDate", undefined);
      result.contractStartDate = startDate >= 0 ? dates.MSddMMyyyyHHmmS(startDate) : undefined;
      result.contractEndDate = EndDate >= 0 ? dates.MSddMMyyyyHHmmS(EndDate) : undefined;

      contract.contractID = result.contractID
      contract.contractAmount = result.contractAmount
      contract.contractStartDate = result.contractStartDate
      contract.contractEndDate = result.contractEndDate
      contract.oldEjariNumber = result.oldEjariNumber
      contract.paymentCount = result.paymentCount
      contract.userReferenceNo = result.userReferenceNo || ""


      return contract;

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
