'use strict';
let rp = require('request-promise')

async function handleREGAUTHevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<Request Recieved for Event>>>>")
    console.log(JSON.stringify(payload, null, 2));
    console.log(payload.eventData.eventName, "===========================>handleDLDevents THIS IS PAYLOAD");

    switch (payload.eventData.eventName) {

      case "EventOnNewRegistration": {
        try {
          await getPromise(payload, eventOnDataChange(payload), callback);
        } catch (e) {
          console.log(e);
        }
        break;
      }

      case "EventOnDataChange": {
        try {
          await getPromise(payload, eventOnDataChange(payload), callback);
        } catch (e) {
          console.log(e);
        }
        break;
      }
      default:
        return callback({
          error: true,
          message: "invalid case"
        })
    }
  }
  catch (err) {
    console.log(err);
  }
}
function eventOnDataChange(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD");

  return async () => {
    let options = {
      method: 'POST',
      url: ' http://localhost:9082/API/UR/eventOnDataChange',
      body:
      {
        header:
        {
          username: "",
          password: ""
        },
        body: {
          "unifiedID": "JAFZA_TradeLicenceNumber",
          "eventData": {},
          "deltaData": {}
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

exports.handleREGAUTHevents = handleREGAUTHevents;