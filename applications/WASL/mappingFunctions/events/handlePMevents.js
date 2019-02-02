'use strict';
let rp = require('request-promise');
const transformTemplate = require('../../../../lib/helpers/transformTemplate');

async function handlePMevents(payload, UUIDKey, route, callback, JWToken) {

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
      default:
        callback({
          error: true,
          message: "invalid case"
        })
    }
    return Promise.resolve(true);
  }
  catch (err) {
    console.log(err.message);
    callback({
      error: true,
      message: err.message,

      response: {
        request: err.options || "THIS IS REQUEST",
        response: err.error || err
      }
    });
    return Promise.resolve(true);
  }

}

function UpdateContractStatus(contractID) {
  console.log("UpdateContractStatus===============><===============UpdateContractStatus");

  let message = {
    method: 'POST',
    url: 'http://51.140.250.28/API/PR/UpdateContractStatus',
    body: {
      header:
        {
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


async function createMessage(payload) {

  return await {
    method: 'POST',
    url: payload.endpoint.address,
    body: {
      header:
        {
          username: payload.header.username,
          password: payload.header.password
        },
      body: await transformTemplate(payload.template.data, payload.eventData, [])
    },
    json: true
  };
}

async function getPromise(payload, message, callback) {
  return rp(message).then(result => {
    console.log("RESPONSE===============>", response, "<===============RESPONSE");
    callback({
      error: false,
      message: payload.eventData.eventName + " Dispatched",
      response: {request: message.body, result}
    })
  });
}

exports.handlePMevents = handlePMevents;
