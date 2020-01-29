'use strict';

let rp = require('request-promise');
// const transformTemplate = require('../../../../lib/helpers/transformTemplate');

async function handleAccrualEvent(payload, UUIDKey, route, callback, JWToken) {

  try {
    console.log("<<<=Request Recieved for Event>>>")
    console.log(JSON.stringify(payload, null, 2), "========> THIS IS PAYLOAD");

    switch (payload.eventData.eventName) {

      case "EventOnPostTransactionToBlockchain": {
        try {
          await EventOnPostTransactionToBlockchain(payload);
        } catch (e) {
          console.log(e);
          return e;
        }
        return getPromise(payload, EventOnPostTransactionToBlockchain(payload), callback)
      }

      default:
        callback({
          error: true,
          message: "invalid case"
        });
        break;
    }
  }
  catch (err) {
    console.log(err)
  }
}

function EventOnPostTransactionToBlockchain(payload) {
  console.log("PAYLOADY=====================> ",
    payload.eventData, " <=====================PAYLOADY");
  return async () => {
    console.log("OUTPUT=====================> ",
      await transformTemplate("EventOnPostTransactionToBlockchain", payload.eventData, []),
      " <=====================OUTPUT");
    let options = {
      method: 'POST',
      url: 'http://51.140.250.28/API/PR/RequestKYC',
      body:
      {
        header:
        {
          username: 'api_user',
          password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
        },
        body: await transformTemplate("EventOnPostTransactionToBlockchain", payload.eventData, [])
        // body: EventOnUpdateFirstPaymentStatus

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

exports.handleAccrualEvent = handleAccrualEvent;


