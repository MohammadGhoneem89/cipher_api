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
        let result = await GetContractDetailsBackOffice(payload.eventData.contractID, payload.eventData.EIDA);
        let message = await createMessageAssociatedPayments(payload,result.contractDetail);
        payload.eventData = result.contractDetail;
        await getPromise(payload, message, callback);
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
        "residenceAddr": mResponse.data.PersonInfo.Address.City.CityDescEN,
        "contactPersonMobile": mResponse.data.PersonInfo.Contact.MobileNo == null ? "00971" : mResponse.data.PersonInfo.Contact.MobileNo,
        "nationality": mResponse.data.PersonInfo.Address.Emirate.EmirateDescEN,
        "dateOfBirth": mResponse.data.PersonInfo.DOB,
        "natId": mResponse.data.PersonInfo.EmiratesID.EIDNumber,
        "natIdExpDate": mResponse.data.PersonInfo.EmiratesID.EIDExpiryDate,
        "poBox": mResponse.data.PersonInfo.Contact.POBox == null ? "1000" : mResponse.data.PersonInfo.Contact.POBox,
        "passport": {
          "passportNo": mResponse.data.PersonInfo.Passport.PPNumber,
          "passportIssueDate": mResponse.data.PersonInfo.Passport.PPIssueDate,
          "passportExpiryDate": mResponse.data.PersonInfo.Passport.PPExpiryDate,
          "passportIssuePlace": mResponse.data.PersonInfo.Passport.PPIssuePlaceEN
        },
        "phoneNo": mResponse.data.PersonInfo.Contact.HomePhoneNo,
        "gender": mResponse.data.PersonInfo.Sex == 1 ? "M" : "F",
        "tenantNameEn": mResponse.data.PersonInfo.ApplicantNameEN,
        "tenantNameAr": mResponse.data.PersonInfo.ApplicantNameAR,
        "visaNo": mResponse.data.PersonInfo.ImmigrationFile.FileNumber.toString(),
        "visaIssueDate": mResponse.data.PersonInfo.ImmigrationFile.FileIssueDate,
        "visaExpiryDate": mResponse.data.PersonInfo.ImmigrationFile.FileExpiryDate,
        "visaStatus": mResponse.data.PersonInfo.ImmigrationFile.FileStatus
      }
    },
    json: true
  };
  return rp(message);
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
    console.log("GetContractDetailsBackOffice===========>", result, "<===========GetContractDetailsBackOffice");
    return Promise.resolve(result);
  });
}
function createMessageAssociatedPayments(payload,data) {
  let message = {
    method: 'POST',
    url: payload.endpoint.address,
    body: {
      header: payload.endpoint.auth,
      body: {
        "contractID": data.contractID,
        "firstPayment": "false",
        "paymentInstruments": data.paymentInstruments.map((item)=>{
          return {
            "bankCode": item.bankCode,
            "paymentMethod": item.paymentMethod,
            "instrumentID": item.instrumentID,
            "status": item.status,
            "date": item.date,
            "amount": item.amount
          }
        })
      }
    },
    json: true
  };
  console.log("createMessageAssociatedPayments===========>", message, "<===========createMessageAssociatedPayments");
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
  console.log("REQUEST===============>", message, "<===============REQUEST");
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
