'use strict';
let rp = require('request-promise');
const _ = require('lodash');
const config = require('../../../../config');
const transformTemplate = require('../../../../lib/helpers/transformTemplate');
const Endpoint = require('../../../../core/Controller/endpoint');

async function handlePMevents(payload, UUIDKey, route, callback, JWToken) {

  console.log('===========handlePMevents payload=======', JSON.stringify(payload))


  // invoke event blockchain
  // blockchain route api
  // payload
  //
  // ServiceURL


  try {
    console.log("<<<<<<<<< Request Recieved for PM Event >>>>>>>>");
    console.log(JSON.stringify(payload, null, 2));
    switch (payload.eventData.eventName) {
      case "UpdateFirstPaymentInstrumentStatus": {
        await UpdateContractStatus(payload.eventData.contractID);
        await getPromise(payload, await createMessage(payload), callback);
        break;
      }
      case "UpdatePaymentInstrumentStatus": {
        await UpdateContractStatus(payload.eventData.contractID);
        await getPromise(payload, await createMessage(payload), callback);
        break;
      }
      case "RequestKYC": {
        let result = await RequestKYC(payload);
        callback({
          error: false,
          message: payload.eventData.eventName + " Dispatched",
          request: await createMessage(payload).body,
          response: result
        });
        break;
      }
      case "AssociatePaymentInstruments": {
        console.log("PAYLOAD=======>", payload, "<=======PAYLOAD");
        let isCancelPaymentEvent = _.get(payload, "template.name") === "CancelBankPayment";
        if (isCancelPaymentEvent && payload.additionalData.length > 0) {//FOR BANK TO CANCEL OLD REPLACED PAYMENTS
          let result = await GetPaymentInstrumentData(payload.eventData.contractID, payload.eventData.EIDA);
          let message = await CancelOldPayments(payload, payload.eventData.EIDA);
        } else {//FOR WASAL TO INFORM PAYMENTS ARE ASSOCIATED
          let result = await GetContractDetailsBackOffice(payload.eventData.contractID, payload.eventData.EIDA);
          let message = await createMessageAssociatedPayments(payload, result.contractDetail);
          await getPromise(payload, message, callback);
        }


        break;
      }
      default:
        callback({
          error: true,
          message: "invalid case",
          request: "",
          response: "invalid case"
        })
    }
    return Promise.resolve(true);
  }
  catch (err) {
    console.log(err.message);
    callback({
      error: true,
      message: err.message,
      request: "FAILED",
      response: err
    });
    return Promise.resolve(true);
  }

}

function UpdateContractStatus(contractID) {
  console.log("UpdateContractStatus===============><===============UpdateContractStatus");
  let url = config.get('URLRestInterface') || "http://0.0.0.0/";
  let message = {
    method: 'POST',
    url: `${url}API/PR/UpdateContractStatus`,
    body: {
      header: config.get('eventService.Avanza_ISC') || {
        username: "Internal_API",
        password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
      },
      body: {
        "orgCode": "WASL",
        "contractID": contractID
      }
    },
    json: true
  };
  return rp(message).then(result => {
    console.log("Update Contract Status Response===========>", result, "<===========Update Contract Status Response");
    return Promise.resolve(true);
  });
}

async function RequestKYC(payload) {

  // let req = _.cloneDeep(payload.eventData);
  let req = await transformTemplate(payload.template.data, payload.eventData, []);
  let _endpoint = new Endpoint(req);
  let ServiceURL = '/';
  let GDRFAResponse = await _endpoint.executeEndpoint(payload.endpoint, ServiceURL);
  console.log("=========Response from GDRFA======>" + JSON.stringify(GDRFAResponse), "<=========Response from GDRFA======");
  if (GDRFAResponse && (GDRFAResponse.success === false || GDRFAResponse.error === true)) {
    throw GDRFAResponse.message;
  }
  let UpdateKYCDetailResult = await UpdateKYCDetail(GDRFAResponse);
  console.log("=========UpdateKYCDetailResult======>" + JSON.stringify(UpdateKYCDetailResult), "<=========UpdateKYCDetailResult======");
}

function UpdateKYCDetail(mResponse) {
  console.log("UpdateKYCDetail===============><===============UpdateKYCDetail");

  let url = config.get('URLRestInterface') || "http://0.0.0.0/";
  let message = {
    method: 'POST',
    url: `${url}API/PR/UpdateKYCDetail`,
    body: {
      header: config.get('eventService.Avanza_ISC') || {
        username: "Internal_API",
        password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
      },
      body: {
        "residenceAddr": _.get(mResponse, "data.PersonInfo.Address.City.CityDescEN", ""),
        "contactPersonMobile": _.get(mResponse, "data.PersonInfo.Contact.MobileNo", null) == null ? "00971" : mResponse.data.PersonInfo.Contact.MobileNo,
        "nationality": _.get(mResponse, "data.PersonInfo.Address.Emirate.EmirateDescEN", ""),
        "dateOfBirth": _.get(mResponse, "data.PersonInfo.DOB", ""),
        "natId": _.get(mResponse, "data.PersonInfo.EmiratesID.EIDNumber", ""),
        "natIdExpDate": _.get(mResponse, "data.PersonInfo.EmiratesID.EIDExpiryDate", ""),
        "poBox": _.get(mResponse, "data.PersonInfo.Contact.POBox", null) == null ? "1000" : mResponse.data.PersonInfo.Contact.POBox,
        "passport": {
          "passportNo": _.get(mResponse, "data.PersonInfo.Passport.PPNumber", ""),
          "passportIssueDate": _.get(mResponse, "data.PersonInfo.Passport.PPIssueDate", ""),
          "passportExpiryDate": _.get(mResponse, "data.PersonInfo.Passport.PPExpiryDate", ""),
          "passportIssuePlace": _.get(mResponse, "data.PersonInfo.Passport.PPIssuePlaceEN", ""),
        },
        "phoneNo": _.get(mResponse, "data.PersonInfo.Contact.HomePhoneNo", ""),
        "gender": _.get(mResponse, "data.PersonInfo.Sex", 1) === 1 ? "M" : "F",
        "tenantNameEn": _.get(mResponse, "data.PersonInfo.ApplicantNameEN", ""),
        "tenantNameAr": _.get(mResponse, "data.PersonInfo.ApplicantNameAR", ""),
        "visaNo": _.get(mResponse, "data.PersonInfo.ImmigrationFile.FileNumber", "").toString(),
        "visaIssueDate": _.get(mResponse, "data.PersonInfo.ImmigrationFile.FileIssueDate", ""),
        "visaExpiryDate": _.get(mResponse, "data.PersonInfo.ImmigrationFile.FileExpiryDate", ""),
        "visaStatus": _.get(mResponse, "data.PersonInfo.ImmigrationFile.FileStatus", ""),
      }
    },
    json: true
  };
  return rp(message);
}

async function GetPaymentInstrumentData(contractID, internalInstrumentID, bankCode) {
  let url = config.get('URLRestInterface') || "http://0.0.0.0/";
  let message = {
    method: 'POST',
    url: `${url}API/PR/GetPaymentInstrumentData`,
    body: {
      header: config.get('eventService.Avanza_ISC') || {
        username: "Internal_API",
        password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
      },
      body: {
        contractID: contractID,
        internalInstrumentID: internalInstrumentID,
        bankCode: bankCode
      }
    },
    json: true
  };
  return rp(message).then(result => {
    console.log("GetPaymentInstrumentData===========>", result, "<===========GetPaymentInstrumentData");
    return Promise.resolve(result);
  });
}

async function CancelOldPayments(payload, EIDA) {


  let eventData = {
    contractID: "",
    bankCode: "",
    instrumentID: "",
    paymentMethod: "",
    internalInstrumentID: "",
    date: "",
    amount: "",
    status: ""
  };


  let req = await transformTemplate(payload.template.data, eventData, []);
  let _endpoint = new Endpoint(req);
  let ServiceURL = '/';
  let GDRFAResponse = await _endpoint.executeEndpoint(payload.endpoint, ServiceURL);
  console.log("=========Response from GDRFA======>" + JSON.stringify(GDRFAResponse), "<=========Response from GDRFA======");
}

function GetContractDetailsBackOffice(contractID, EIDA) {
  let url = config.get('URLRestInterface') || "http://0.0.0.0/";
  let message = {
    method: 'POST',
    url: `${url}API/PR/GetContractDetailsBackOffice`,
    body: {
      header: config.get('eventService.Avanza_ISC') || {
        username: "Internal_API",
        password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
      },
      body: {
        "orgCode": "WASL",
        "contractID": contractID,
        "EIDA": EIDA
      }
    },
    json: true
  };
  return rp(message).then(result => {
    console.log("GetContractDetailsBackOffice===========>", JSON.stringify(result), "<===========GetContractDetailsBackOffice");
    return Promise.resolve(result);
  });
}

function createMessageAssociatedPayments(payload, data) {
  let isNotReplacement = true;
  let message = {
    method: 'POST',
    url: payload.endpoint.address,
    body: {
      header: payload.endpoint.auth,
      body: {
        "contractID": data.contractID,
        "paymentInstruments": data.paymentInstruments.map((item) => {
          if (item.oldInstrumentRefNo) {
            isNotReplacement = false
          }
          return {
            "bankCode": item.bankCode,
            "paymentMethod": item.paymentMethod,
            "instrumentID": item.instrumentID,
            "status": item.status,
            "date": item.date,
            "amount": item.amount,
            "bankMetaData": item.bankMetaData
          }
        }),
        "firstPayment": isNotReplacement,
      }
    },
    json: true
  };
  console.log("createMessageAssociatedPayments===========>", JSON.stringify(message), "<===========createMessageAssociatedPayments");
  return Promise.resolve(message);
}

async function createMessage(payload) {
  return await {
    method: 'POST',
    url: payload.endpoint.address,
    body: {
      header: payload.endpoint.auth,
      body: await transformTemplate(payload.template.data, payload.eventData, [])
    },
    json: true
  };
}

async function getPromise(payload, message, callback) {
  console.log("REQUEST===============>", JSON.stringify(message, null, 2), "<===============REQUEST");
  return rp(message).then(result => {
    console.log("RESPONSE===============>", result, "<===============RESPONSE");
    message.body && _.set(message.body, 'header.password', "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    callback({
      error: false,
      message: payload.eventData.eventName + " Dispatched",
      request: message.body,
      response: result
    })
  });
}

exports.handlePMevents = handlePMevents;
