'use strict';
const comparisonFunction = require('../comparison');
const jsons = require('../jsons');
const rp = require('request-promise');
const config = require('../../../../../config');

function cleanEventData(eventData) {
 
  let newEventData = _.clone(eventData);
  _.unset(newEventData, '__collection');
  _.unset(newEventData, 'additionalData');
  _.unset(newEventData, 'eventName');
  _.unset(newEventData, 'documentName');
  _.unset(newEventData, 'key');

  return newEventData;
}

let data = _.clone(payload.eventData);
    _.unset(data, 'key');
    _.unset(data, 'oldData');

    let oldData = _.clone(payload.eventData.oldData)
    _.unset(oldData, 'key');

    let deltaData = comparisonFunction.manipulator(data, oldData);

async function handleREGAUTHevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<Request Recieved for Event>>>>")
    console.log(JSON.stringify(payload, null, 2), "---+++++ !!!! >>>?????  I AM PAYLOAD ");
    console.log(payload.eventData.eventName, "===========================>event name here");
    // console.log(payload.template, "===========================> template here");

    switch (payload.eventData.eventName) {

      case "eventOnDeclaration": {
        try {
          await getPromise(payload, eventOnDeclaration(payload, deltaData), callback);
        } catch (e) {
          console.log(e);
          return e;
        }
        break;
      }
      case "EventOnNewRegistration": {
        try {
          await getPromise(payload, eventOnNewRegistration(payload, deltaData), callback);
        } catch (e) {
          console.log(e);
          return e;
        }
        break;
      }

      case "EventOnDataChange": {
        let deltaData = comparisonFunction.manipulator(cleanEventData(data),cleanEventData(oldData));
        try {
          await getPromise(payload, eventOnDataChange(payload, deltaData), callback);
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

function eventOnNewRegistration(payload) {

  return async () => {
    let options = {
      method: 'POST',
      url: payload.endpoint.address,
      body:
      {
        header:  {
          username: payload.endpoint.auth.username,
          password: payload.endpoint.auth.password
        },
        body: {
          "unifiedID": payload.eventData.unifiedID,
          "eventData": cleanEventData(payload.eventData),
          "deltaData" : []
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

  return async () => {
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/postDataToBlockchainRegAuth`,
      url: payload.endpoint.address,
      body:
      {
        header:  {
          username: payload.endpoint.auth.username,
          password: payload.endpoint.auth.password
        },
        body: {
          "unifiedID": payload.eventData.unifiedID,
          "eventData": cleanEventData(payload.eventData),
          "deltaData": deltaData
        }
      },
      json: true
    };

    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    console.log(deltaData,"///////////////    deltaData")
    return rp(options);
  }
}


async function getPromise(payload, func, callback) {
  func().then(response => {
    console.log("RESPONSE===============>", response, "<===============RESPONSE");
    callback({
      error: response.messageStatus == "OK" ? false : true,
      message: payload.eventData.eventName + (response.messageStatus == "OK" ? " Dispatched" : "  Not Dispatched"),
      // request: message.body,
      response: response
    })
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: true,
      message: err.name,
      // request: message.body,
      response: err
    })
  });
}

exports.handleREGAUTHevents = handleREGAUTHevents;