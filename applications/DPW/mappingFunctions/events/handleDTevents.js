
'use strict';
let rp = require('request-promise');
const comparisonFunction = require('./comparison');
const config = require('../../../../config');
const _ = require('lodash')
const transformTemplate = require('../../../../lib/helpers/transformTemplate');
var cheerio = require('cheerio');

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
async function handleDTevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<<<<<<< Request Recieved for Event >>>>>>>>")
    console.log(JSON.stringify(payload, null, 2), "========> THIS IS PAYLOAD")

    switch (payload.eventData.eventName) {
      case "eventOnContainerStatusChange": {
        let deltaData = comparisonFunction.manipulator(cleanEventData(payload.eventData),cleanEventData(payload.eventData.oldData));
        try {
          await getPromiseJSONapi(payload, eventOnContainerStatusChange(payload, deltaData), callback);
        } catch (e) {
          console.log(e);
          return e;
        }
        break;
      }
      case "InstallSmartContract": {
        try {
          await getPromiseWithOrgCode(payload,"TRADE","DT", revise.reviseSmartContract, callback);
        } catch (e) {
          console.log(e);
        }
        break;
      }
      case "DeploySmartContract": {
        try {
          console.dir(revise.deploySmartContract)
          await getPromise(payload, revise.deploySmartContract, callback);
        } catch (e) {
          console.log(e);
        }
        break;
      }
      case "EventOnNewRegistration":
        {
          if (payload.eventData) {
            console.log("<<<<  EventOnNewRegistration >>>>>> ")
            try {
              await associateAliasFromCustID(payload, createApproveRegistration(payload), callback)
            } catch (e) {
              console.log(e);
              return e;
            }
            break;
            //1-  call createApproveReg
            //2-  let globalID=reponse.globalID
          }
        }
      case "EventOnDataChange":
        {
          if (payload.eventData.status == "TERMINATED") {
            try {
              await getPromise(payload, endRegistration(payload), callback)
            } catch (e) {
              console.log(e);
              return e
            }
            break;
            //1-  call ENDREG
          }
          else {
            try {
              await getPromise(payload, updateRegistration(payload), callback)
            } catch (e) {
              console.log(e);
              return e;
            }
            break;
            //call updateRegistration
          }
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
      request: "",
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
function createApproveRegistration(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD");

  return async () => {
    console.log("OUTPUT============================OUTPUT");
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/UpdateContractStatus`,
      url: payload.endpoint.address,
      json: false,
      body: await transformTemplate(payload.template.data, payload.eventData, [])
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}

function updateRegistration(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD",
    payload.eventData.status, "<<<<<<<<<payload status");

  return async () => {
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/UpdateContractStatus`,
      url: payload.endpoint.address,
      body: await transformTemplate(payload.template.updateRegData, payload.eventData),
      json: false
    };

    let $ = cheerio.load(options.body, {
      xml: {
        normalizeWhitespace: true,
      }
    });

    //finding globalCustomerId in aliasList
    for (let alias of payload.eventData.aliasList) {
      if(alias.startsWith('DT') || alias.startsWith('TRADE')) {
        console.log("---alias---", alias ,"---alias---")
        console.log($("sch\\:globalCustId").text())
        $("sch\\:globalCustId").text(alias)
      }
    }

    console.log($("sch\\:globalCustId").text())
    options.body = $.xml();

    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}

function associateAlias(payload, globalCustId) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD");

  return async () => {
    console.log("OUTPUT========================OUTPUT");
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/associateAlias`,
      url: config.get('eventService.AssociateAliasURL'),
      body:
      {
        header: config.get('eventService.Avanza_ISC') || {
          username: "Internal_API",
          password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
        },
        body: {
          "unifiedID": payload.eventData.unifiedID,
          "alias": [
            {
              "key": globalCustId,
              "type": ""
            }
          ]
        }
      },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}

function endRegistration(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD",
    payload.eventData.status, "<<<<<<<<<payload status");

  return async () => {
    console.log("OUTPUT========================OUTPUT");
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/UpdateContractStatus`,
      url: payload.endpoint.address,
      body: await transformTemplate(payload.template.endRegData, payload.eventData, []),
      json: false
    };

    let $ = cheerio.load(options.body, {
      xml: {
        normalizeWhitespace: true,
      }
    });

    //finding globalCustomerId in aliasList
    for (let alias of payload.eventData.aliasList) {
      if(alias.startsWith('DT') || alias.startsWith('TRADE')) {
        console.log("---alias---", alias ,"---alias---")
        console.log($("sch\\:globalCustId").text())
        $("sch\\:globalCustId").text(alias)
      }
    }

    console.log($("sch\\:globalCustId").text())
    options.body = $.xml();

    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}


async function associateAliasFromCustID(payload, func, callback) {
  func().then(response => {
    console.log("------------response-----------------", response)
    let $ = cheerio.load(response, {
      xml: {
        normalizeWhitespace: true,
      }
    });
    if ($("sch\\:status").text() == "SUCCESS") {
      getPromiseForCreate(payload, associateAlias(payload, $("sch\\:globalCustId").text()), callback)
    }
    else {
      callback({
        error: true,
        message: $("sch\\:status").text(),
        response: response
      })
    }
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: true,
      message: err.name,
      response: err
    })
  });
}

async function getPromiseForCreate(payload, func, callback) {
  func().then(response => {
    console.log(response, "RESPONSE");
    callback({
      error: response.errorCode == 200 ? false : true,
      message: response.errorCode == 200 ? payload.eventData.eventName + " Dispatched" : "Internal Error. " + response.errorDescription,
      response: response
    })
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: true,
      message: "Internal Error. " + err.name,
      response: err
    })
  });
}

async function getPromise(payload, func, callback) {
  func().then(response => {
    console.log("response===============>", response, "<==========response");
    let $ = cheerio.load(response, {
      xml: {
        normalizeWhitespace: true,
      }
    });
    callback({
      error: $("sch\\:status").text() == "SUCCESS" ? false : true,
      message: $("sch\\:status").text() == "SUCCESS" ? payload.eventData.eventName + " Dispatched" : $("sch\\:status").text(),
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

<<<<<<< HEAD
async function getPromiseWithOrgCode(payload,orgCode,orgCode1, func, callback) {
  func(payload,orgCode,orgCode1).then(response => {
=======

async function getPromiseJSONapi(payload, func, callback) {
  func(payload).then(response => {
>>>>>>> bae0ce16075534013ae0528f9befc3b6e0cdad97
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
exports.handleDTevents = handleDTevents;