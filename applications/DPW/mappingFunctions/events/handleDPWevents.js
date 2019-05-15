'use strict';
let rp = require('request-promise');
const config = require('../../../../config');
const _ = require('lodash')
const comparisonFunction = require('./comparison');


function cleanEventData(eventData) {
  let newEventData = _.clone(eventData);
  _.unset(newEventData, '__collection');
  _.unset(newEventData, 'additionalData');
  _.unset(newEventData, 'eventName');
  _.unset(newEventData, 'documentName');
  _.unset(newEventData, 'key');
  _.unset(newEventData, 'oldData');
  return newEventData;
}

async function handleDPWevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<Request Recieved for Event>>>>")
    console.log(JSON.stringify(payload, null, 2), "---+++++ !!!! >>>?????  I AM PAYLOAD ");
    console.log(payload.eventData.eventName, "===========================>event name here");
    let deltaData = comparisonFunction.manipulator(cleanEventData(payload.eventData),cleanEventData(payload.eventData.oldData));
    
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
exports.handleDPWevents = handleDPWevents