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
      result.contractStartDate = startDate >= 0 ? dates.MSddMMyyyy(startDate) : undefined;
      result.contractEndDate = EndDate >= 0 ? dates.MSddMMyyyy(EndDate) : undefined;
      result.paymentInstruments.forEach((element, index) => {
        element.date = dates.MSddMMyyyy(element.date);
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
      result.contractStartDate = startDate >= 0 ? dates.MSddMMyyyy(startDate) : undefined;
      result.contractEndDate = EndDate >= 0 ? dates.MSddMMyyyy(EndDate) : undefined;

      result.paymentInstruments.forEach((element, index) => {
        element.date = dates.MSddMMyyyy(element.date);
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
      _.set(result, 'ejariData.contractID', undefined);
      _.set(result, 'terminationDate', undefined);
      _.set(result, 'terminationReason', undefined);
      _.set(result, 'tranDate', undefined);


      _.set(result, 'businessPartnerNo', _.get(result, "businessPartnerNumber", undefined));
      _.set(result, 'businessPartnerNumber', undefined);


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
      result.contractStartDate = startDate >= 0 ? dates.MSddMMyyyy(startDate) : undefined;
      result.contractEndDate = EndDate >= 0 ? dates.MSddMMyyyy(EndDate) : undefined;

      result.paymentInstruments.forEach((element, index) => {
        element.date = dates.MSddMMyyyy(element.date);
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
    let result=JSON.parse(data);
    let contract = {};
    let startDate = _.get(result, "contractStartDate", undefined);
    let EndDate = _.get(result, "contractEndDate", undefined);
    result.contractStartDate = startDate >= 0 ? dates.MSddMMyyyy(startDate) : undefined;
    result.contractEndDate = EndDate >= 0 ? dates.MSddMMyyyy(EndDate) : undefined;
    _.set(contract, 'contractID', result.contractID||"");
    _.set(contract, 'contractAmount', result.contractAmount||"");
    _.set(contract, 'contractStartDate', result.contractStartDate||"");
    _.set(contract, 'contractEndDate', result.contractEndDate||"");
    _.set(contract, 'oldEjariNumber', result.oldEjariNumber||"");
    _.set(contract, 'paymentCount', result.paymentCount||"");
    _.set(contract, 'userReferenceNo', result.userReferenceNo||"");

    return contract;

  },

  ParseKYCDetailGDRFA: (data, payload, jwt) => {
    console.log("THIS IS MY VALUE---------->", data);

    try {
      let result = data;

      let dateOfBirth = _.get(result, "dateOfBirth", undefined);
      let natIdExpDate = _.get(result, "natIdExpDate", undefined);
      let passportIssueDate = _.get(result, "passport.passportIssueDate", undefined);
      let passportExpiryDate = _.get(result, "passport.passportExpiryDate", undefined);
      let visaIssueDate = _.get(result, "visaIssueDate", undefined);
      let visaExpiryDate = _.get(result, "visaExpiryDate", undefined);
      let lastSyncDate = _.get(result, "lastSyncDate", undefined);



      _.get(result, "dateOfBirth", dateOfBirth >= 0 ? dates.MSddMMyyyy(dateOfBirth) : undefined);
      _.get(result, "natIdExpDate", natIdExpDate >= 0 ? dates.MSddMMyyyy(natIdExpDate) : undefined);
      _.get(result, "passport.passportIssueDate", passportIssueDate >= 0 ? dates.MSddMMyyyy(passportIssueDate) : undefined);
      _.get(result, "passport.passportExpiryDate", passportExpiryDate >= 0 ? dates.MSddMMyyyy(passportExpiryDate) : undefined);
      _.get(result, "visaIssueDate", visaIssueDate >= 0 ? dates.MSddMMyyyy(visaIssueDate) : undefined);
      _.get(result, "visaExpiryDate", visaExpiryDate >= 0 ? dates.MSddMMyyyy(visaExpiryDate) : undefined);
      _.get(result, "lastSyncDate", lastSyncDate >= 0 ? dates.MSddMMyyyy(lastSyncDate) : undefined);


      _.set(result, 'emiratesIDExpiryDate', undefined);
      _.set(result, 'phoneNo', _.get(result, "phoneNO", undefined));
      _.set(result, 'phoneNO', undefined);

      _.set(result, 'natId', _.get(result, "natID", undefined));
      _.set(result, 'natID', undefined);

      _.set(result, 'natIdExpDate', _.get(result, "natIDExpDate", undefined));
      _.set(result, 'natIDExpDate', undefined);


      return result;

    } catch (ex) {
      console.log(ex);
      return jsonParseNoError(data, payload, jwt);
    }
  },

  ParseKYCDetailSDG: (data, payload, jwt) => {


    try {
      let result = data;
      let sdgVisaExpiryDate = _.get(result, "visaExpiryDate", undefined);
      _.set(result, "visaExpiryDate", sdgVisaExpiryDate >= 0 ? dates.MSddMMyyyy(sdgVisaExpiryDate) : undefined);
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
