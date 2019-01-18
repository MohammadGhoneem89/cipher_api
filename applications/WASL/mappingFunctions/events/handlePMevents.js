
'use strict';
//var objectMapper = require('object-mapper');
let Handlebars = require('handlebars');
let rp = require('request-promise');
let jsonTransformTemplates = require('../../lib/repositories/jsonTransformTemplate.js');

async function handlePMevents(payload, UUIDKey, route, callback, JWToken) {

  try {
    console.log("<<<<<<<<< Request Recieved for Event >>>>>>>>")
    console.log(JSON.stringify(payload, null, 2))
console.log(payload.eventName,"===========================> THIS IS PAYLOAD")
    switch (payload.eventName) {

      case "RenewContract":
        {
          return callback({
            error: false,
            message: "RenewContract"
          })

        }
      case "UpdateContract":
        {
          return callback({
            error: false,
            message: "UpdateContract"
          })

        }
      case "EventOnUpdateFirstPaymentStatus":
        {
          return await getPromise(payload, UpdateContractStatus, callback);

        }
      case "EventOnUpdatePaymentStatus":
        {
          return await getPromise(payload, UpdateContractStatus, callback);

        }

      case "UpdateKYCDetail":
        {
          return await getPromise(payload, updateKYCDetail, callback);

        }
      case "EjariData":
        {
          return await getPromise(payload, EjariAvailable, callback);
        }

      default:
        return callback({
          error: true,
          message: "invalid case"
        })

    }
  }
  catch (err) {
    console.log(err)
  }
}
exports.handlePMevents = handlePMevents




function updateKYCDetail() {

  let options = {
    method: 'POST',
    url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain',
    qs: { eventName: 'updateKYCDetail' },
    body:
    {
      header:
      {
        username: 'api_user',
        password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
      },
      body:
      {
        residenceAddress: 'wer',
        contactPersonMobile: '234',
        nationality: 'sfef',
        dateOfBirth: '',
        emiratesIDNumber: '12341234',
        emiratesIDExpiryDate: '',
        POBox: '',
        passportExpiryDate: '',
        passportIssueDate: '',
        passportIssuePlace: '',
        passportNumber: '',
        phoneNumber: '',
        gender: '',
        tenantNameEnglish: '',
        tenantNameArabic: '',
        visaExpiryDate: '',
        visaNo: '',
        visaStatus: '',
        visaStartDate: ''
      }
    },
    json: true
  };
  return rp(options);
}

function EjariAvailable() {
  var options = {
    method: 'POST',
    url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain',
    qs: { eventName: 'ejariAvailable' },
    body:
    {
      header:
      {
        username: 'api_user',
        password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
      },
      body:
      {
        contractID: '4323940',
        ejariID: '389492834',
        date: '05/11/2018'
      }
    },
    json: true
  };

  return rp(options);
}

function UpdateContractStatus() {
  let options = {
    method: 'POST',
    url: 'http://51.140.250.28/API/PR/UpdateContractStatus',
    body:
    {
      bypassSimu: false,
      header:
      {
        username: 'waslapi',
        password: 'aa8dd29e572a64982d7d2bf48325a4951b7c399a1283fb33460ca275e230d5ae308dcd820d808c5ea0d23e047bd2f3e066bf402cb249d989408331566f7ca890'
      },
      body:
      {
        EIDA: '784-1984-1234567-9',
        authToken: '03452837803',
        contractID: 'DIRC103',
        orgCode: 'WASL'
      }
    },
    json: true
  };
  return rp(options);
}


async function getPromise(payload, func, callback) {
  func().then(function (body) {
    console.log(payload.eventName + " dispatched", body)
  }).catch(function (err) {
    console.log("error : ", err)
  })
  callback({
    error: true,
    message: payload.eventName + " dispatched"
  })
}

function transformTemplate() {
  jsonTransformTemplates.findOne({"TemplateId" : "UpdateFirstPaymentStatus"})
  .then((res)=>{
    console.log('---------------');
    console.log(res,"I AM RESSSSSS");
  });

  let source = {"header": {"username": "username","password": "password"},"body": {"contractID": "{{payload.eventData.contractID}}","eventType":" {{payload.eventType}}","paymentInstruments": {"instrumentID": "ECHEQUE0001","paymentMethod": "001","status": "001","date": "05/11/2018","amount": "5000","bankCode": "ENBD","bankMetaData": {"MICR": "xxxxxxxxxx","paymentID": "ECHEQUE1111"},"failureReasonCode": "","failureDescription": ""}}};
  let template = Handlebars.compile(JSON.stringify(source));

  let data = {
    "payload":{"eventData":{"contractID":"TerminateContract"},"eventType":"TC"},
  };
  let result = template(data);
  return result;
}
console.log(transformTemplate());