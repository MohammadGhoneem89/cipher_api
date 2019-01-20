'use strict';
//var objectMapper = require('object-mapper');
let Handlebars = require('handlebars');
let rp = require('request-promise');
let jsonTransformTemplates = require('../../lib/repositories/jsonTransformTemplate.js');


async function handlePMevents(payload, UUIDKey, route, callback, JWToken) {

  try {
    console.log("<<<<<<<<< Request Recieved for Event >>>>>>>>")
    console.log(JSON.stringify(payload, null, 2))
    console.log(payload.eventName, "===========================> THIS IS PAYLOAD")
    switch (payload.eventName) {

      case "RenewContract": {
        return callback({
          error: false,
          message: "RenewContract"
        })

      }
      case "UpdateContract": {
        return callback({
          error: false,
          message: "UpdateContract"
        })

      }
      case "EventOnUpdateFirstPaymentStatus": {
        return await getPromise(payload, UpdateContractStatus, callback);

      }
      case "EventOnUpdatePaymentStatus": {
        return await getPromise(payload, UpdateContractStatus, callback);

      }

      case "UpdateKYCDetail": {
        return await getPromise(payload, updateKYCDetail(payload), callback);

      }
      case "EjariData": {
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

exports.handlePMevents = handlePMevents;


function updateKYCDetail(payload) {
  let EventOnUpdateKYCDetail = {
    "header": {
      "username": "api_user",
      "password": "2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b"
    },
    "body": {
      "residenceAddress": "{{GDRFA.residenceAddr}}",
      "contactPersonMobile": "{{GDRFA.contactPersonMobile}}",
      "nationality": "{{GDRFA.nationality}}",
      "dateOfBirth": "{{GDRFA.dateOfBirth}}",
      "emiratesIDNumber": "{{GDRFA.natID}}",
      "emiratesIDExpiryDate": "{{GDRFA.emiratesIDExpiryDate}}",
      "POBox": "{{GDRFA.poBox}}",
      "passportExpiryDate": "{{GDRFA.passport.passportExpiryDate}}",
      "passportIssueDate": "{{GDRFA.passport.passportIssueDate}}",
      "passportIssuePlace": "{{GDRFA.passport.passportIssuePlace}}",
      "passportNumber": "{{GDRFA.passport.passportNo}}",
      "phoneNumber": "{{GDRFA.phoneNO}}",
      "gender": "{{GDRFA.gender}}",
      "tenantNameEnglish": "{{GDRFA.tenantNameEn}}",
      "tenantNameArabic": "{{GDRFA.tenantNameAr}}",
      "visaExpiryDate": "{{GDRFA.visaExpiryDate}}",
      "visaNo": "{{GDRFA.visaNo}}",
      "visaStatus": "{{GDRFA.visaStatus}}",
      "visaStartDate": "{{GDRFA.visaIssueDate}}"
    }
  };


  return ()=>{
    let options = {
      method: 'POST',
      url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain?eventName=updateKYCDetail',
      body:
        {
          header:
            {
              username: 'api_user',
              password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
            },
          body: transformTemplate(EventOnUpdateKYCDetail, payload.eventData)

        },
      json: true
    };
    console.log("<============CALLING PM API================>")
    console.log(options);
    console.log("<============CALLING PM API================>")
    return rp(options);
  }

}

function EjariAvailable(payload) {
  var options = {
    method: 'POST',
    url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain',
    qs: {eventName: 'ejariAvailable'},
    body:
      {
        header:
          {
            username: payload.header.username,
            password: payload.header.password
          },
        body:
          {
            contractID: payload.contractID,
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
  func()
    .then(function (body) {
      console.log(payload.eventName + " dispatched", body)
      callback({
        message: body
      })
    })
    .catch(function (err) {
      console.log("error : ", err)
      callback({
        message: err
      })
    })
}


function transformTemplate(templateName, data) {
  // jsonTransformTemplates.findOne({})
  //   .then((res) => {
  //     console.log('---------------');
  //     console.log(res, "I AM RESSSSSS");
  //   });

  let templateCompiler = Handlebars.compile(JSON.stringify(templateName));

  // let data = {
  //   "GDRFA": {
  //     "contactPersonMobile": "0557168540",
  //     "dateOfBirth": 5112000,
  //     "emiratesIDExpiryDate": 0,
  //     "gender": "Male",
  //     "lastSyncDate": "",
  //     "natID": "784-1984-1234567-17",
  //     "natIDExpDate": 1541376000000,
  //     "nationality": "Pakistan",
  //     "passport": {
  //       "passportExpiryDate": "01012020",
  //       "passportIssueDate": "01012010",
  //       "passportIssuePlace": "Dubai",
  //       "passportNo": "AB00000"
  //     },
  //     "phoneNO": "040000000",
  //     "poBox": "1000",
  //     "residenceAddr": "Al Nahda Dubai",
  //     "tenantNameAr": "الاسم الكامل عربي ",
  //     "tenantNameEn": "Sandeep Kumar",
  //     "visaExpiryDate": 1577836800000,
  //     "visaIssueDate": "1451606400000",
  //     "visaNo": "2010716123456",
  //     "visaStatus": "Valid"
  //   },
  //   "SDG": {
  //     "customerName": "Arham Ali",
  //     "emailID": "arham.ali@avanzainnovation.com",
  //     "emiratesID": "784-1984-1234567-17",
  //     "emiratesIDExpiryDate": 1609372800000,
  //     "mobileNumber": "03452837803",
  //     "visaExpiryDate": 1638316800000,
  //     "visaNo": "Visa11111"
  //   },
  //   "documentName": "kycCollection",
  //   "key": "EIDA_784-1984-1234567-17",
  //   "eventName": "UpdateKYCDetail"
  // };

  return templateCompiler(data);
}

console.log(transformTemplate());