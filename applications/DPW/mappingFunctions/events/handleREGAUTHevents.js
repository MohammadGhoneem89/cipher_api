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
  _.unset(newEventData, 'nonVATCustomer');
  _.unset(newEventData, 'nonVATCustomer');



  //remove
  _.unset(newEventData, 'alias');
  _.unset(newEventData, 'aliasList');


  //to do
  _.unset(newEventData, 'licenseCategoryCodeDescAr');
  _.unset(newEventData, 'licenseCategoryCodeDescEn');
  _.unset(newEventData, 'tradeLicense');



  _.unset(newEventData, 'POBOX');
  _.unset(newEventData, 'fax');
  _.unset(newEventData, 'VATAccountNo');
  _.unset(newEventData, 'VATRegCertificate');



  newEventData.licenseCategoryDodeDescAr = eventData.licenseCategoryCodeDescAr
  newEventData.licenseCategoryDodeDescEn = eventData.licenseCategoryCodeDescEn
  newEventData.vatAccountNo = eventData.VATAccountNo
  newEventData.vatRegCertificate = eventData.VATRegCertificate

  newEventData.poBox = eventData.POBOX
  newEventData.FAX = eventData.fax
  newEventData.vatAccountNo = eventData.VATAccountNo
  newEventData.vatRegCertificate = eventData.VATRegCertificate




  return newEventData;
}
async function handleREGAUTHevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    // console.log("<<<Request Recieved for Event>>>>")
    // console.log(JSON.stringify(payload, null, 2), "---+++++ !!!! >>>?????  I AM PAYLOAD ");
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

      case "EventOnDataChangeForPORT": {

        processDataChange(payload, callback)
        break;
      }
      case "EventOnDataChangeForTRADE": {

        processDataChange(payload, callback)
        break;
      }
      case "EventOnDataChangeForCUSTOMS": {

        processDataChange(payload, callback)
        break;
      }
      case "EventOnDataChangeForCHAMBEROFCOMM": {

        processDataChange(payload, callback)
        break;
      }
      case "InstallSmartContract": {
        try {
          await getPromiseWithOrgCode(payload, "REGAUTH", "JAFZA", revise.reviseSmartContract, callback);
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

async function processDataChange(payload, callback) {
  try {
    let deltaData = comparisonFunction.manipulator(cleanEventData(payload.eventData), cleanEventData(payload.eventData.oldData));
    let message = await eventOnDataChange(payload, deltaData)
    await getPromise(payload, message, callback);
    //getPromise(payload, , callback);
  } catch (e) {
    console.log(e);
    return e;
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
    console.log("eventOnDeclaration============" + JSON.stringify(message.body.body) + "=============eventOnDeclaration");
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
        header: {
          username: payload.endpoint.auth.username,
          password: payload.endpoint.auth.password
        },
        body: {
          "unifiedID": payload.eventData.unifiedID,
          "eventData": cleanEventData(payload.eventData),
          "deltaData": []
        }
      },
      json: true
    };

    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}

function eventOnDataChange(payload, deltaData) {
  console.log("eventOnDataChange PAYLOAD=====================> ");
  //   payload.eventData, " <=====================PAYLOAD");
  let message = {
    method: 'POST',
    url: payload.endpoint.address,
    body:
    {
      header: {
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

  console.log("REQUEST===============>", message, "<===============REQUEST");
  return Promise.resolve(message);

}


async function getPromise(payload, message, callback) {

  return rp(message).then(response => {
    console.log("RESPONSE===============>", response, "<===============RESPONSE");
    _.set(message.body, 'header.password', "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    callback({
      error: false,
      message: payload.eventData.eventName + " Dispatched",
      response: {
        request: message,
        response: response
      }

    })
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: true,
      message: payload.eventData.eventName + " Failed",
      response: {
        request: message,
        response: err
      }
    })
  });
}



async function getPromiseWithOrgCode(payload, orgCode, orgCode1, func, callback) {
  func(payload, orgCode, orgCode1).then(response => {
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

async function getConfig(payload, UUIDKey, route, callback, JWToken) {
  let configuration = config.get(payload.body.key);
  callback({
    getChannelConfig: {
      error: false,
      message: "Channel List",
      response: configuration
    }
  })

}

exports.handleREGAUTHevents = handleREGAUTHevents;
exports.getConfig = getConfig;