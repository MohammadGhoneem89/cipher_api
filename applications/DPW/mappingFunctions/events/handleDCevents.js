'use strict';
let rp = require('request-promise');
const _ = require('lodash');
const config = require('../../../../../config');
const comparisonFunction = require('../comparison');


function cleanEventData(eventData) {
 
  let newEventData = _.clone(eventData);
  _.unset(newEventData, '__collection');
  _.unset(newEventData, 'additionalData');
  _.unset(newEventData, 'eventName');
  _.unset(newEventData, 'documentName');
  _.unset(newEventData, 'key');

  return newEventData;
}

async function handleDCevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<Request Recieved for Event>>>>")
    console.log(JSON.stringify(payload, null, 2), "---+++++ !!!! >>>?????  I AM PAYLOAD ");
    console.log(payload.eventData.eventName, "===========================>event name here");

    // let deltaData = comparisonFunction.manipulator(jsons.current, payload.eventData);
    let data = _.clone(payload.eventData);
    _.unset(data, 'key');
    _.unset(data, 'oldData');

    let oldData = _.clone(payload.eventData.oldData)
    _.unset(oldData, 'key');
    console.log(data, "===========================> DATA");
    console.log(oldData, "OLD DATA")
    let deltaData = comparisonFunction.manipulator(data, oldData);

    switch (payload.eventData.eventName) {
      case "eventOnContainerStatusChange": {

        try {
          await getPromise(payload, eventOnContainerStatusChange(payload, deltaData), callback);
        } catch (e) {
          console.log(e);
          return e;
        }
        break;
      }
      case "eventOnDeclaration": {
        try {
          await getPromise(payload, eventOnDeclaration(payload, deltaData), callback);
        } catch (e) {
          console.log(e);
          return e;
        }
        break;
      }
      case "eventOnCOO": {
        try {
          await getPromise(payload, eventOnCOO(payload, deltaData), callback);
        } catch (e) {
          console.log(e);
          return e;
        }
        break;
      }
      case "eventOnVesselDeparted": {
        try {
          await getPromise(payload, eventOnVesselDeparted(payload, deltaData), callback);
        } catch (e) {
          console.log(e);
          return e;
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
      message: err.name,
      request: "FAILED",
      response: err
    });
    return Promise.resolve(true);
  }

}

function eventOnDeclaration(payload, deltaData) {
  
  return async () => {
    let message = {
      method: 'POST',
      url: payload.endpoint.address,
      body: {
        header: {
          username: payload.endpoint.auth.username,
          password: payload.endpoint.auth.password
        },
        body: {
          "eventData": cleanEventData(payload.eventData),
          "deltaData": deltaData
        }
      },
      json: true
    };
    console.log("eventOnDeclaration============"+ JSON.stringify(message.body.body) +"=============eventOnDeclaration");
    return rp(message);
  }
}
function eventOnCOO(payload, deltaData) {
 return async () => {
    let message = {
      method: 'POST',
      url: payload.endpoint.address,
      body: {
        header: {
          username: payload.endpoint.auth.username,
          password: payload.endpoint.auth.password
        },
        body: {
          "eventData": cleanEventData(payload.eventData),
          "deltaData": deltaData
        }
      },
      json: true
    };
    console.log("eventOnCOO======="+ JSON.stringify(message.body.body) +"========eventOnCOO");
    return rp(message);
  }
}

function eventOnVesselDeparted(payload) {
  
  let additionalData = payload.eventData.additionalData
  return async () => {
    let message = {
      method: 'POST',
      url: payload.endpoint.address,
      body: {
        header: {
          username: payload.endpoint.auth.username,
          password: payload.endpoint.auth.password
        },
        body: {
          "eventData": cleanEventData(payload.eventData),
          "additionalData": additionalData
        }
      },
      json: true
    };
    console.log("eventOnVesselDeparted============"+ JSON.stringify(message.body.body) +"======eventOnVesselDeparted");

    return rp(message);
  }
}


function eventOnContainerStatusChange(payload, deltaData) {

  // console.log("eventOnContainerStatusChange===============>" + deltaData[0] + "<===============eventOnContainerStatusChange");
  return async () => {
    let message = {
      method: 'POST',
      url: payload.endpoint.address,
      body: {
        header: {
          username: payload.endpoint.auth.username,
          password: payload.endpoint.auth.password
        },
        body: {
          "eventData": cleanEventData(payload.eventData),
          "deltaData": deltaData
        }
      },
      json: true
    };
    console.log("eventOnContainerStatusChange===============>" + JSON.stringify(message.body.body) + "<===============eventOnContainerStatusChange");
    return rp(message);
  }
}
async function getPromise(payload, func, callback) {
  func().then(response => {
    console.log("response===============>", response, "<==========response");
    callback({
      error: response.messageStatus == "OK" ? false : true,
      message: payload.eventData.eventName + (response.messageStatus == "OK" ? " Dispatched" : " Not Dispatched"),
      // request: message.body,
      response: response
    })
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: true,
      message: err.name,
      //request: message.body,
      response: err
    })
  });
}
exports.handleDCevents = handleDCevents;
