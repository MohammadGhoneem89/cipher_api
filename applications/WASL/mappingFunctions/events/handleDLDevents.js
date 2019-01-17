
'use strict';
let rp=require('request-promise')
async function handleDLDevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<Request Recieved for Event>>>>")
    console.log(JSON.stringify(payload, null, 2), "========> THIS IS PAYLOAD")

    switch (payload.eventName) {

      case "EjariTerminationStatus":
        {
          return getPromise(payload,TerminateContract,callback)
        }

      case "TerminateContract":
        {
          return getPromise(payload,TerminateContract,callback)
        }
      case "EventOnTerminateContract":
        {

        }
      
      case "EventOnUpdateKYCDetail":
        {

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
exports.handleDLDevents = handleDLDevents


function TerminateContract() {
  var options = {
    method: 'POST',
    url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain',
    qs: { eventName: 'terminateContract' },
    body:
    {
      header:
      {
        username: 'api_user',
        password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
      },
      body:
      {
        contractID: '4323940',
        terminationReason: '001',
        paymentInstruments:
          [{
            bankCode: 'ENBD',
            instrumentID: '987123',
            cancellationReason: '001'
          },
          {
            bankCode: 'ENBD',
            instrumentID: '987124',
            'cancellationReason ': '001'
          }]
      }
    },
    json: true
  };
  return rp(options);
}

async function getPromise(payload,func,callback){
  func().then(function (body) {
    console.log(payload.eventName+ " dispatched", body)
  }).catch(function (err) {
    console.log("error : ", err)
  })
  callback({
    error: true,
    message: payload.eventName +" dispatched"
  })
}