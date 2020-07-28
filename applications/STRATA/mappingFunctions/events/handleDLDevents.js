'use strict';
let rp = require('request-promise')
const transformTemplate = require('../../../../lib/helpers/transformTemplate');
const typeData = require('../../../../lib/services/typeData.js')

async function handleDLDevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<Request Recieved for Event>>>>")
    console.log(JSON.stringify(payload, null, 2));
    console.log(payload.eventData.eventName, "===========================>handleDLDevents THIS IS PAYLOAD");

    switch (payload.eventData.eventName) {

      case "TerminateContract": {
        try {
          await getPromise(payload, EventOnTerminateContract(payload), callback);
        } catch (e) {
          console.log(e);
        }
        break;
      }

      case "UpdateFirstPaymentInstrumentStatus": {
        try {
          await getPromise(payload, EventOnRequestEjari(payload), callback);
        } catch (e) {
          console.log(e);
        }
        break;
      }
      case "UpdateKYCDetail": {
        try {
          await getPromise(payload, EventOnUpdateKYCDetail(payload), callback);
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

function EventOnUpdateKYCDetail(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD");
  return async () => {
    console.log("OUTPUT=====================> ",
      await transformTemplate("EventOnUpdateKYCDetail-DLD", payload.eventData, []),
      " <=====================OUTPUT");
    let options = {
      method: 'POST',
      url: 'http://qa.dubailand.gov.ae:8885/v1/TenancyContracts/EventOnUpdateKYCDetail',
      body:
      {
        header:
        {
          username: "",
          password: ""
        },
        body: await transformTemplate("EventOnUpdateKYCDetail-DLD", payload.eventData, [])
      },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }

}

function EventOnRequestEjari(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD",
    payload.eventData.status, "<<<<<<<<<payload status");

  return async () => {
    let paid = await getStatusfromTypeData();
    if (payload.eventData.status === paid) {
      console.log("Contract Status received is PAID  !!!!!!!!!!!!!!!!!!!!!")
      console.log("OUTPUT=====================> ",
        await transformTemplate("EventOnRequestEjari", payload.eventData, []),
        " <=====================OUTPUT");
      let options = {
        method: 'POST',
        url: 'http://qa.dubailand.gov.ae:8885/v1/TenancyContracts/EventOnRequestEjari',
        body:
        {
          header:
          {
            username: "",
            password: ""
          },
          body: await transformTemplate("EventOnRequestEjari", payload.eventData, [])
        },
        json: true
      };
      console.log("REQUEST===============>", options.body, "<===============REQUEST");
      return rp(options);
    }
    else {
      return Promise.reject("First Payment is not Paid");
    }
  }

}

function EventOnTerminateContract(payload) {
  console.log("PAYLOADY=====================> ",
    payload.eventData, " <=====================PAYLOADY");
  return async () => {
    console.log("OUTPUT=====================> ",
      await transformTemplate("EventOnTerminateContract", payload.eventData, []),
      " <=====================OUTPUT");
    let options = {
      method: 'POST',
      url: 'http://qa.dubailand.gov.ae:8885/v1/TenancyContracts/EventOnTerminateContract',
      body:
      {
        header:
        {
          username: 'api_user',
          password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
        },
        body: await transformTemplate("EventOnTerminateContract", payload.eventData, [])
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
async function getStatusfromTypeData() {
  let getStatusfromTypeData = "";
  let test = await typeData.getTypeData("InstrumentStatus")
  let JSONtest = JSON.stringify(test.data.InstrumentStatus);
  let parseJSONtest = JSON.parse(JSONtest)
  for (let i = 0; i < parseJSONtest.length; i++) {
    if (parseJSONtest[i].label === "PAID") {
      //console.log(parseJSONtest[i].label, "JSONVALUEEEEEEEEEEEEEEEEEEEEEEEEE")
      getStatusfromTypeData = parseJSONtest[i].value;
      return getStatusfromTypeData;
    }
  }
}
exports.handleDLDevents = handleDLDevents;