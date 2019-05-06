'use strict';
let rp = require('request-promise');
const comparisonFunction = require('./comparison');

async function handleDPWevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<Request Recieved for Event>>>>")
    console.log(JSON.stringify(payload, null, 2), "---+++++ !!!! >>>?????  I AM PAYLOAD ");
    console.log(payload.eventData.eventName, "===========================>event name here");
    // console.log(payload.template, "===========================> template here");
    let deltaData = comparisonFunction.manipulator(jsons.current, payload.eventData);

    switch (payload.eventData.eventName) {
      case "eventOnContainerStatusChange": {
        try {
          await getPromise(payload, eventOnContainerStatusChange(payload, deltaData), callback);
        } catch (e) {
          console.log(e);
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
async function eventOnContainerStatusChange(payload, deltaData) {

  console.log("eventOnContainerStatusChange===============><===============eventOnContainerStatusChange");
  let url = config.get('URLRestInterface') || "http://0.0.0.0/";
  let message = {
    method: 'POST',
    url: `${url}API/PR/eventOnContainerStatusChange`,
    body: {
      header: config.get('eventService.Avanza_ISC') || {
        username: "Internal_API",
        password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
      },
      body: {
        "eventData": payload.eventData,
        "deltaData": deltaData[0]
      }
    },
    json: true
  };
  return rp(message).then(result => {
    console.log("eventOnContainerStatusChange===========>", result, "<===========eventOnContainerStatusChange");
    return Promise.resolve(true);
  });
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
exports.handleDPWevents = handleDPWevents