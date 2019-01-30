'use strict';
let rp = require('request-promise');
const transformTemplate = require('../../../../lib/helpers/transformTemplate');

async function handlePMevents(payload, route, callback, JWToken) {

  try {
    console.log("<<<<<<<<< Request Recieved for PM Event >>>>>>>>");
    console.log(JSON.stringify(payload, null, 2));
    console.log(payload.eventData.eventName, "===========================>handlePMevents THIS IS PAYLOAD");
    // switch (payload.eventData.eventName) {
    //
    //   case "UpdateFirstPaymentInstrumentStatus": {
    //     try {
    //       await UpdateContractStatus(payload);
    //       await getPromise(payload, updateFirstPaymentStatus(payload), callback);
    //     } catch (e) {
    //       console.log(e);
    //     }
    //     break;
    //   }
    //   case "UpdatePaymentInstrumentStatus": {
    //     try {
    //       await UpdateContractStatus(payload);
    //       await getPromise(payload, updatePaymentStatus(payload), callback);
    //     } catch (e) {
    //       console.log(e);
    //     }
    //     break;
    //   }
    //
    //   case "UpdateKYCDetail": {
    //     try {
    //       await getPromise(payload, updateKYCDetail(payload), callback);
    //     }
    //     catch (e) {
    //       console.log(e);
    //     }
    //     break;
    //   }
    //   case "EjariData": {
    //     try {
    //       await getPromise(payload, EjariAvailable(payload), callback);
    //     }
    //     catch (e) {
    //       console.log(e);
    //     }
    //     break;
    //   }
    //   case "EjariTerminationStatus": {
    //     try {
    //       await getPromise(payload, EjariTermination(payload), callback);
    //     } catch (e) {
    //       console.log(e);
    //     }
    //     break;
    //   }
    //
    //   default:
    //     return callback({
    //       error: true,
    //       message: "invalid case"
    //     })
    //
    // }

    callback({
      error: false,
      message: payload.eventData.eventName + " Dispatched",
      response: {request: "THIS IS REQUEST", response:"THIS IS RESPONSE"}
    })
  }
  catch (err) {
    console.log(err);
    callback({
      error: true,
      message: err,
      response: {request: "THIS IS REQUEST", response:"THIS IS RESPONSE"}
    })
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
          body: await transformTemplate("EventOnUpdateKYCDetail-WASL", payload.eventData, [])

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
// console.log("REQUEST===============>", options.body, "<===============REQUEST");
// return rp(options);
    return;
  }
}

function UpdateContractStatus(payload) {
  console.log("UpdateContractStatus===============><===============UpdateContractStatus");
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
// return;
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
