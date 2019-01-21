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
        try{
          await UpdateContractStatus(payload);
        }catch (e) {
          console.log(e);
        }

        return await getPromise(payload, updateFirstPaymentStatus(payload), callback);

      }
      case "UpdatePaymentInstrumentStatus": {
        try{
          await UpdateContractStatus(payload);
        }catch (e) {
          console.log(e);
        }
        return await getPromise(payload, updatePaymentStatus(payload), callback);
      }

      case "UpdateKYCDetail": {
        return await getPromise(payload, updateKYCDetail(payload), callback);

      }
      case "EjariData": {
        return await getPromise(payload, EjariAvailable(payload), callback);
      }
      case "EjariTerminationStatus": {
        return await getPromise(payload, EjariTermination(payload), callback);
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
  console.log("PAYLOADY=====================> ", payload.eventData, " <=====================PAYLOADY");


  return async () => {
    console.log("OUTPUT=====================> ", await transformTemplate("EventOnUpdatePaymentStatus", payload.eventData, []), " <=====================OUTPUT");
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
          body: await transformTemplate("EventOnUpdatePaymentStatus", payload.eventData, [])
          // body: EventOnUpdateFirstPaymentStatus

        },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
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
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
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
          body: await transformTemplate("EventOnUpdateKYCDetail", payload.eventData, [])

        },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }

}

function EjariAvailable(payload) {
  return async () => {
    let options = {
      method: 'POST',
      url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain?eventName=terminateContract',
      body:
        {
          header:
            {
              username: 'api_user',
              password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
            },
          body: await transformTemplate("EventOnEjariAvailable", payload.eventData, [])
        },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}

function EjariTermination(payload) {
  return async () => {
    let options = {
      method: 'POST',
      url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain?eventName=terminateContract',
      body:
        {
          header:
            {
              username: 'api_user',
              password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
            },
          body: await transformTemplate("EventOnEjariTerminationStatus", payload.eventData, [])
        },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}

function UpdateContractStatus(payload) {
  return async () => {
    let options = {
      method: 'POST',
      url: 'http://51.140.250.28/API/PR/UpdateContractStatus',
      body:
        {
          "header": {
            "username": "Internal_API",
            "password": "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
          },
          "body": {
            "orgCode": "WASL",
            "contractID": payload.eventData.contractID
          }
        },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}


async function getPromise(payload, func, callback) {
  func().then(response => {
    console.log("RESPONSE===============>", response, "<===============RESPONSE");
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

exports.handlePMevents = handlePMevents;