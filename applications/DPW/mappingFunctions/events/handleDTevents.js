
'use strict';
let rp = require('request-promise');

async function handleDTevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<<<<<<< Request Recieved for Event >>>>>>>>")
    console.log(JSON.stringify(payload, null, 2), "========> THIS IS PAYLOAD")

    switch (payload.eventData.eventName) {

      case "EventOnNewRegistration":
        {
          if (payload.eventData) {
            console.log("<<<<  EventOnNewRegistration >>>>>> ")
            try {
              await getPromise(payload, createApproveRegistration(payload), callback)
            } catch (e) {
              console.log(e);
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
            }
            break;
            //1-  call ENDREG
          }
          else {
            try {
              await getPromise(payload, updateRegistration(payload), callback)
            } catch (e) {
              console.log(e);
            }
            break;
            //call updateRegistration
          }
        }

      default:
        return callback({
          error: true,
          message: "invalid case"
        })
    }

  }
  catch (err) {
    console.log(err)
  }
}
exports.handleDTevents = handleDTevents;

function createApproveRegistration(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD");

  return async () => {
    console.log("OUTPUT=====================> ",
      await JSONCOMPARISON("createApproveReg", payload.eventData, []),
      " <=====================OUTPUT");
    let options = {
      method: 'POST',
      url: 'http://dtdev.dubaitrade.ae/umws/ws/umService.wsdl',
      body:
      {
        header:
        {
          username: "",
          password: ""
        },

        //KAMRAN JSON COMPARISON FUNCTION (ALREADY USED IN handleREGAUTHevents.js)
        body: await JSONCOMPARISONFUNCTION("", '', [])
      },
      json: true
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
    console.log("OUTPUT=====================> ",
      await JSONCOMPARISON("createApproveReg", payload.eventData, []),
      " <=====================OUTPUT");
    let options = {
      method: 'POST',
      url: 'http://dtdev.dubaitrade.ae/umws/ws/umService.wsdl',
      body:
      {
        header:
        {
          username: "",
          password: ""
        },
        //body: await transformTemplate("EventOnRequestEjari", payload.eventData, [])

        body: await JSONCOMPARISONFUNCTION("", '', [])
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
    console.log("OUTPUT=====================> ",
      await JSONCOMPARISON("createApproveReg", payload.eventData, []),
      " <=====================OUTPUT");
    let options = {
      method: 'POST',
      url: 'http://dtdev.dubaitrade.ae/umws/ws/umService.wsdl',
      body:
      {
        header:
        {
          username: "",
          password: ""
        },
        //body: await transformTemplate("EventOnRequestEjari", payload.eventData, [])

        body: await JSONCOMPARISONFUNCTION("", '', [])
      },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }
}

async function getPromise(payload, func, callback) {
  func().then(response => {
    console.log(response, "RESPONSE");
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