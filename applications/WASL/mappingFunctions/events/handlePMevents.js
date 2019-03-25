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
        RequestKYC(payload);
       
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
      request: "THIS IS REQUEST",
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
  let req = _.cloneDeep(payload.eventData);
  req = await transformTemplate(payload.template.data, payload.eventData, [])
  let _endpoint = new Endpoint(req);
  let ServiceURL = '/';
  _endpoint.executeEndpoint(payload.endpoint, ServiceURL).then((resp) => {
    if (resp) {
      console.log("=========Response from GDRFA======" + JSON.stringify(resp))
      

      if (resp.success === false || resp.error === true) {
        throw new Error(resp.message);
      }
    }
    let mResponse = resp;
    console.log(mResponse.data.PersonInfo.Address.Passport, "|||||||||||||")
   UpdateKYCDetail(mResponse);
    return resp;
  }).catch((ex) => {
    console.log(ex);
    throw new Error(ex.message);
  });
}

function UpdateKYCDetail(mResponse) {
  console.log("UpdateKYCDetail===============><===============UpdateKYCDetail");
  //  let url = config.get('URLRestInterface') || "http://0.0.0.0/";
  let message = {
    method: 'POST',
    url: 'http://51.140.250.28/API/PR/UpdateKYCDetail',
    body: {
      header: 
      {
        "username": "gdrfaapi",
        "password": "b933d03e1b877de6128ad78ab5f96585c99e8321574adb45ff31f597d577acf731d53b17fc42c9a85a197b0b77ef87af6e25f044e689f1b9dbe28fcf73bb074a"  },
      body: {
     
         "residenceAddr":mResponse.data.PersonInfo.Address.City.CityDescEN,
        "contactPersonMobile": mResponse.data.PersonInfo.Contact.MobileNo == null ?"00971": mResponse.data.PersonInfo.Contact.MobileNo,
        "nationality": mResponse.data.PersonInfo.Address.Emirate.EmirateDescEN,
        "dateOfBirth": mResponse.data.PersonInfo.DOB,
         "natId":mResponse.data.PersonInfo.EmiratesID.EIDNumber,
         "natIdExpDate":mResponse.data.PersonInfo.EmiratesID.EIDExpiryDate,
         "poBox": mResponse.data.PersonInfo.Contact.POBox == null ? "1000" : mResponse.data.PersonInfo.Contact.POBox,
        "passport": {
            "passportNo": mResponse.data.PersonInfo.Passport.PPNumber,
            "passportIssueDate": mResponse.data.PersonInfo.Passport.PPIssueDate,
            "passportExpiryDate": mResponse.data.PersonInfo.Passport.PPExpiryDate,
            "passportIssuePlace": mResponse.data.PersonInfo.Passport.PPIssuePlaceEN
        },
        "phoneNo": mResponse.data.PersonInfo.Contact.HomePhoneNo,
        "gender": mResponse.data.PersonInfo.Sex == 1 ? "M":"F",
        "tenantNameEn": mResponse.data.PersonInfo.ApplicantNameEN,
        "tenantNameAr":  mResponse.data.PersonInfo.ApplicantNameAR,
        "visaNo": mResponse.data.PersonInfo.ImmigrationFile.FileNumber.toString(),
        "visaIssueDate": mResponse.data.PersonInfo.ImmigrationFile.FileIssueDate,
        "visaExpiryDate": mResponse.data.PersonInfo.ImmigrationFile.FileExpiryDate,
        "visaStatus": mResponse.data.PersonInfo.ImmigrationFile.FileStatus
      }
    },
    json: true
  };
  return rp(message).then(result => {
    console.log("~~~~~~~`",message,"~~~~~~~~~~")
    console.log("UpdateKYCDetail Response===========>", result, "<===========UpdateKYCDetail Response");
    return Promise.resolve(true);
  });
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
