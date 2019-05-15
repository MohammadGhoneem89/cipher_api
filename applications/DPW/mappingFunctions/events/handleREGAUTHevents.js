'use strict';
const comparisonFunction = require('./comparison');
const jsons = require('./jsons');
const rp = require('request-promise');
const _ = require('lodash')
const config = require('../../../../config');
const revise = require('./ccDeployment/approveAttribute');

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
async function handleREGAUTHevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<Request Recieved for Event>>>>")
    console.log(JSON.stringify(payload, null, 2), "---+++++ !!!! >>>?????  I AM PAYLOAD ");
    console.log(payload.eventData.eventName, "===========================>event name here");
    // console.log(payload.template, "===========================> template here");
    let deltaData = comparisonFunction.manipulator(cleanEventData(payload.eventData),cleanEventData(payload.eventData.oldData));
   
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
          await getPromise(payload, eventOnNewRegistration(payload), callback);
        } catch (e) {
          console.log(e);
          return e;
        }
        break;
      }

      case "EventOnDataChange": {
        
        try {
          await getPromise(payload, eventOnDataChange(payload, deltaData), callback);
        } catch (e) {
          console.log(e);
          return e;
        }
        break;
      }
      case "InstallSmartContract": {
        try {
          await getPromise(payload, revise.reviseSmartContract, callback);
        } catch (e) {
          console.log(e);
          return e;
        }
        break;
      }
      case "DeploySmartContract": {
        try {
          console.dir(revise.deploySmartContract)
          await getPromise(payload, revise.deploySmartContract, callback);
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
          "deltaData": deltaData
        }
      },
      json: true
    };

    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}


async function getPromise(payload, func, callback) {
  func(payload).then(response => {
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
      response: new Error(err).message
    })
  });
}

exports.handleREGAUTHevents = handleREGAUTHevents;