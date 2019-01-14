
'use strict';
//var objectMapper = require('object-mapper');
let rp = require('request-promise');


async function handlePMevents(payload, UUIDKey, route, callback, JWToken) {

  try {
    console.log("<<<<<<<<< Request Recieved for Event >>>>>>>>")
    console.log(JSON.stringify(payload.eventName, null, 2))

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

          options.body.eventName = payload.eventName
          //payload is input and based on template we get the revised
          //transformed json that we can pass to the REST Call
          rp(options)
            .then(function (body) {
              // POST succeeded...
              return true;
            })
            .catch(function (err) {
              // POST failed...
              return false;
            });
        }
      case "EventOnUpdatePaymentStatus":
        {

        }
      case "EventOnEjariAvailable":
        {

        }
      case "ReplacePaymentInstruments":
        {

        }
      case "ReplacePaymentInstrumentsBackOffice":
        {

        }
      case "TerminateContract":
        {

        }
      case "EventOnTerminateContract":
        {

        }
      case "EventOnUpdateKYCDetail":
        {

        }
      case "UpdateKYCDetail":
        {

          updateKYCDetail().then(function (body) {
            // POST succeeded...
            console.log("updateKYCDetail dispatched", body)
          })
            .catch(function (err) {
              // POST failed...
              console.log("Error : ", err)

            });
          callback({
            error: false,
            message: "UpdateKYCDetail dispatched"
          })
        }
        case "EjariData":
        {
          EjariAvailable().then(function (body) {
            console.log("EjariAvailable dispatched", body)
          }).catch(function (err) {
            console.log("error : ", err)
          })
          callback({
            error: true,
            message: "EjariAvailable dispatched"
          })
        }

      default:
        callback({
          error: true,
          message: "invalid case"
        })
        break;
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
  var options = { method: 'POST',
  url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain',
  qs: { eventName: 'ejariAvailable' },
  body: 
   { header: 
      { username: 'api_user',
        password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b' },
     body: 
      { contractID: '4323940',
        ejariID: '389492834',
        date: '05/11/2018' } },
  json: true };

  return rp(options);
}