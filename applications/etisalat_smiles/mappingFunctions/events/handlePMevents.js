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
        let message = await createMessage(payload);
        let bankMetaData = _.get(payload.eventData, "bankMetaData", {}); //HACK: For JSON [Object Object] problem with Handlebars.js
        _.set(message, "body.body.paymentInstruments.[0].bankMetaData", bankMetaData);
        await getPromise(payload, message, callback);
        break;
      }
      case "UpdatePaymentInstrumentStatus": {
        await UpdateContractStatus(payload.eventData.contractID);
        let message = await createMessage(payload);
        //let bankMetaData = _.get(message, "body.body.paymentInstruments.[0].bankMetaData", {}); //HACK: For JSON [Object Object] problem with Handlebars.js
       // bankMetaData = JSON.parse(bankMetaData);
        let bankMetaData = _.get(payload.eventData, "bankMetaData", {});
        console.log("MESSAGE>>>>>>>>>>>",message);
        _.set(message, "body.body.paymentInstruments.[0].bankMetaData", bankMetaData);
        console.log("MESSAGE>>>>>>>>>>>",message);
        await getPromise(payload, message, callback);
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
        let isCancelPaymentEvent = _.get(payload, "template.name") === "CancelBankPayment";
        console.log("PAYLOAD=======>", payload, "<=======PAYLOAD");
        let additionalData = _.get(payload, "eventData.additionalData.[0]", []);
        if (isCancelPaymentEvent && additionalData.oldInstrumentsRef.length > 0) {//FOR BANK TO CANCEL OLD REPLACED PAYMENTS
          let params = {
            orgCode: additionalData.orgCode,
            contractID: additionalData.contractID,
            internalInstrumentIDs: additionalData.oldInstrumentsRef,
            bankCodes: config.get('orgCodes')
          };
          let results = await GetPaymentInstrumentData(params);
          await CancelOldPayments(payload, params, results, callback);
          //await getPromise(payload, await createMessage(message), callback);
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

async function GetPaymentInstrumentData({orgCode, contractID, internalInstrumentIDs, bankCodes}) {
  let combinations = [];
  internalInstrumentIDs.map(internalInstrumentID => {
    bankCodes.map(bankCode => {
      combinations.push({internalInstrumentID, bankCode});
    });
  });
  const getData = async () => {
    return await combinations.reduce(async (previousPromise, item) => {
      const collection = await previousPromise;
      const result = await send(item);
      if (_.get(result, "errorCode", false) === 200) {
        collection.push(result.GetPaymentInstrumentData);
      }
      return collection;
    }, Promise.resolve([]))
  };

  function send({internalInstrumentID, bankCode}) {
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
          orgCode: orgCode,
          contractID: contractID,
          internalInstrumentID: internalInstrumentID,
          bankCode: bankCode
        }
      },
      json: true
    };
    return rp(message);
  }

  let results = await getData();
  console.log("GetPaymentInstrumentData===========>", results, "<===========GetPaymentInstrumentData");
  return results;
}

async function CancelOldPayments(payload, params, results, callback) {
  let cancelOrders = [];
  let temp = await Promise.all(results.map(paymentInstrument => send(paymentInstrument)));
  callback({
    error: false,
    message: payload.eventData.eventName + " Dispatched",
    request: {},
    response: cancelOrders
  });
  return temp;

  async function send(paymentInstrument) {
    let eventData = {
      contractID: params.contractID,
      bankCode: paymentInstrument.bankCode,
      instrumentID: paymentInstrument.instrumentID,
      paymentMethod: paymentInstrument.paymentMethod,
      internalInstrumentID: paymentInstrument.internalInstrumentID,
      date: paymentInstrument.date,
      amount: paymentInstrument.amount,
      status: paymentInstrument.status
    };

    let body = await transformTemplate(payload.template.data, eventData, []);

    let _endpoint = new Endpoint({body});
    let ServiceURL = '/';
    let BankResponse = await _endpoint.executeEndpoint(payload.endpoint, ServiceURL);
    console.log("=========Response from Bank======>" + JSON.stringify(BankResponse), "<=========Response from Bank======");
    cancelOrders.push({
      request: body,
      response: BankResponse
    });
  }
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
            "bankMetaData": removeChequeNumberMetaData(item.bankMetaData)
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

function removeChequeNumberMetaData(bankMetaData){

_.unset(bankMetaData, 'chequeNumber')
_.unset(bankMetaData, 'fra')
return bankMetaData;

}


async function createMessage(payload) {
  console.log("TEMPLATE========>", JSON.stringify(payload.template, null, 2), "<=========TEMPLATE");
  console.log("EVENT-DATA========>", JSON.stringify(payload.eventData, null, 2), "<=========EVENT-DATA");
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
