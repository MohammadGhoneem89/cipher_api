'use strict';
const comparisonFunction = require('../comparison');
const jsons = require('../jsons');
const rp = require('request-promise');
const config = require('../../../../../config');
const _ = require("lodash")
async function handleREGAUTHevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<Request Recieved for Event>>>>")
    console.log(JSON.stringify(payload, null, 2), "---+++++ !!!! >>>?????  I AM PAYLOAD ");
    console.log(payload.eventData.eventName, "===========================>event name here");
    // console.log(payload.template, "===========================> template here");
    

    switch (payload.eventData.eventName) {

      case "EventOnNewRegistration": {
        try {
          await getPromise(payload, eventOnNewRegistration(payload), callback);
        } catch (e) {
          console.log(e);
        }
        break;
      }

      case "EventOnDataChange": {

        
        let data = _.clone(payload.eventData);
        _.unset(data, 'key');
        _.unset(data, 'oldData');
        
        let oldData = _.clone(payload.eventData.oldData)
        _.unset(oldData, 'key');
        
        let deltaData = comparisonFunction.manipulator(data,oldData);

        try {
          await getPromise(payload, eventOnDataChange(payload, deltaData), callback);
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

function eventOnNewRegistration(payload) {
  // console.log("PAYLOAD=====================> ",
  //   payload.eventData, " <=====================PAYLOAD");

  console.log("***payload***", payload)

  return async () => {
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/postDataToBlockchainRegAuth`,
      url: payload.endpoint.address,
      body:
      {
        header: config.get('eventService.Avanza_ISC') || {
          username: "Internal_API",
          password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
        },
        body: {
          "unifiedID": payload.eventData.unifiedID,
          "eventData": payload.eventData,
          "deltaData" : {}
        }
      },
      json: true
    };

    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}

function eventOnDataChange(payload, deltaData) {
  // console.log("PAYLOAD=====================> ",
  //   payload.eventData, " <=====================PAYLOAD");

  console.log("***payload***", payload)
  console.log("***deltaData***", deltaData)

  return async () => {
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";

    let eventData = _.clone(payload.eventData)
    _.unset(eventData, 'oldData');

    let options = {
      method: 'POST',
      // url: `${url}API/PR/postDataToBlockchainRegAuth`,
      url: payload.endpoint.address,
      body:
      {
        header: config.get('eventService.Avanza_ISC') || {
          username: "Internal_API",
          password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
        },
        body: {
          "unifiedID": payload.eventData.unifiedID,
          "eventData": payload.eventData,
          "deltaData": deltaData[0]
        }
      },
      json: true
    };

    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    console.log(deltaData[0],"///////////////    deltaData[0]")
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