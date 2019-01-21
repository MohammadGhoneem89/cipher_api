'use strict';
//var objectMapper = require('object-mapper');
let Handlebars = require('handlebars');
let rp = require('request-promise');
const dates = require('../../../../lib/helpers/dates');
const transformTemplate = require('../../../../lib/helpers/transformTemplate');
let jsonTransformTemplates = require('../../lib/repositories/jsonTransformTemplate.js');


async function handlePMevents(payload, UUIDKey, route, callback, JWToken) {

  try {
    console.log("<<<<<<<<< Request Recieved for Event >>>>>>>>")
    console.log(JSON.stringify(payload, null, 2));
    console.log(payload.eventData.eventName, "===========================>handlePMevents THIS IS PAYLOAD");
    switch (payload.eventData.eventName) {

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
      case "UpdateFirstPaymentInstrumentStatus": {
        return await getPromise(payload, updateFirstPaymentStatus(payload), callback);

      }
      case "UpdatePaymentInstrumentStatus": {
        return await getPromise(payload, updatePaymentStatus(payload), callback);
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


function updatePaymentStatus(payload) {
  return async () => {
    let options = {
      method: 'POST',
      url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain?eventName=paymentStatus',
      body:
        {
          header:
            {
              username: 'api_user',
              password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
            },
          body: await transformTemplate("EventOnUpdatePaymentStatus", payload.eventData)
          // body: EventOnUpdateFirstPaymentStatus

        },
      json: true
    };
    return rp(options);
  }

}

function updateFirstPaymentStatus(payload) {
  return async () => {
    let options = {
      method: 'POST',
      url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain?eventName=paymentStatus',
      body:
        {
          header:
            {
              username: 'api_user',
              password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
            },
          body: await transformTemplate("EventOnUpdateFirstPaymentStatus", payload.eventData, [])
        },
      json: true
    };
    return rp(options);
  }

}

function updateKYCDetail(payload) {
  return async () => {
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
          body: await transformTemplate("EventOnUpdateKYCDetail", payload.eventData)

        },
      json: true
    };
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
  func().then(response => {
    console.log(response, "RESPONSE");
    callback({
      error: false,
      message: payload.eventData.eventName + " Dispatched",
      response: response
    })
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: true,
      message: payload.eventData.eventName + " Failed",
      response: err
    })
  });
}

//
// function transformTemplate(templateName, data) {
//   console.log("<====================I AM DATA======================>");
//   console.log(data);
//   console.log("<====================I AM DATA======================>");
//
//   Handlebars.registerHelper('EpochTOHuman', function (d) {
//     console.log("===============>CONVERT DATE: ", typeof (d), d);
//     // return dates.ddMMyyyyslash(d);
//     return "25/10/2019";
//   });
//
//   let templateCompiler = Handlebars.compile(JSON.stringify(templateName));
//
//
//   return templateCompiler(data);
// }


exports.handlePMevents = handlePMevents;