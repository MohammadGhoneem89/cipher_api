
'use strict';
let rp=require('request-promise')
async function handleDLDevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<Request Recieved for Event>>>>")
    console.log(JSON.stringify(payload, null, 2), "========> THIS IS PAYLOAD")

    switch (payload.eventData.eventName) {

      case "EventOnTerminateContract":
        {
          return getPromise(payload,TerminateContract(),callback)
        }

      case "TerminateContract":
        {
          return getPromise(payload,TerminateContract,callback)
        }
      // case "EventOnTerminateContract":
      //   {
      //
      //   }
      // break;
      case "EventOnUpdateKYCDetail":
        {

        }
        break;
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
exports.handleDLDevents = handleDLDevents;


function TerminateContract() {

  // var options = {
  //   method: 'POST',
  //   url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain',
  //   qs: { eventName: 'terminateContract' },
  //   body:
  //   {
  //     header:
  //     {
  //       username: 'api_user',
  //       password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
  //     },
  //     body:
  //     {
  //       contractID: '4323940',
  //       terminationReason: '001',
  //       paymentInstruments:
  //         [{
  //           bankCode: 'ENBD',
  //           instrumentID: '987123',
  //           cancellationReason: '001'
  //         },
  //         {
  //           bankCode: 'ENBD',
  //           instrumentID: '987124',
  //           'cancellationReason ': '001'
  //         }]
  //     }
  //   },
  //   json: true
  // };
  // return rp(options);

  return Promise.resolve({
    methodName: "EventOnTerminateContract",
    message: "DUMMY FUNCTION CALLED"
  })
}

async function getPromise(payload, func, callback) {
  func().then(response => {
    console.log(payload.eventData.eventName + " Dispatched", body);
    callback({
      error: true,
      message: response
    })
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: false,
      message: payload.eventData.eventName + " Dispatched"
    })
  });
}