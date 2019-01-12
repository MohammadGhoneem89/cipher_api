'use strict';
const log4js = require('log4js');
const logger = log4js.getLogger('getTranxByID');
const apiPayload = require('../../lib/services/apiPayload');

const getContractByID = function (payload, UUIDKey, route, callback, JWToken) {
  console.log('===========Payload' + JSON.stringify(payload))

  let query = {
    "action": "APIPayLoadList",
    "searchCriteria": {
      "payloadField": "body.contractID",
      "payloadFieldValue": payload.contractID
    },
    "page": {
      "currentPageNo": 1,
      "pageSize": 10
    },
    "channel": "UI",
    "ipAddress": "::1"
  };
  apiPayload.getList(query)
    .then((payloadData) => {
      getContractDetail(payloadData, callback, JWToken);

    });

};

function getContractDetail(payloadData, responseCallback, JWToken) {

  console.log('=====================' + payloadData.list.length)
  if (payloadData.list.length == 0) {
    responseCallback({});

  } else {

    let res = payloadData.list[0].payload.body;

    let response = {
      "contractDetail": {
        "contractID": res.contractID,
        "contractReference": res.contractReference,
        "lastContractID": res.lastContractID,
        "contractStatus": "002",
        "contractStartDate": res.contractStartDate,
        "contractEndDate": res.contractEndDate,
        "contractAmount": res.contractAmount,
        "tenantName": res.tenantName,
        "propertyReferenceNumber": res.propertyReferenceNumber,
        "oldeEjariNumber": res.oldeEjariNumber,
        "businessPartnerNo": res.businessPartnerNo,
        "paymentMethod": res.paymentMethod,
        "paymentCount": res.paymentCount,
        "userReferenceNumber": res.userReferenceNumber,
        "isEjariTerminated": false,
        "isLegacyContract": res.isLegacyContract,
        "ejariData": {},
        "DEWAData": []
      }
    }
    console.log('================JSON Length====================='+ JSON.stringify(res.installments.length))
    let paymentInstruments = [];
    let ref = response.contractDetail.contractID.padStart(4, '0')
    if (res.installments && res.installments.length > 0) {
      
     
      for (let rec = 0; rec < res.installments.length; rec++) {
        
        let recItem = res.installments[rec];
                
        let paymentInstrumentRecord = {
          "bankCode": recItem.bankCode,
          "paymentMethod": recItem.paymentMethod,
          "instrumentID": rec,
          "status": "004",
          "date": recItem.date,
          "amount": recItem.amount,
          "cancellationReason": "",
          "replacementReason": "",
          "newInstrumentRefNo": "",
          "oldInstrumentRefNo": "",
          "bankMetaData": {
          "MICR": recItem.paymentMethod == "001" ? "MICR" + ref + rec : undefined,
          "registrationNo": recItem.paymentMethod == "002" ? "REG" + ref : undefined,
          "paymentID": recItem.paymentMethod == "002"? "PAYREF" + ref + rec: undefined

          },
          "providerMetaData": recItem.providerMetaData || {},
          "legacyStatus": "004",
          "failureReasonCode": "",
          "failureDescription": ""
        }
        paymentInstruments.push(paymentInstrumentRecord);
      }
      response.contractDetail.paymentInstruments = paymentInstruments;

      responseCallback(response);
    }
  }
}


exports.getContractByID = getContractByID;