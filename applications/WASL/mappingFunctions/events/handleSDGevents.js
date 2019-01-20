
'use strict';
async function handleSDGevents(payload, UUIDKey, route, callback, JWToken) {
    try {
      console.log("<<<<<<<<< Request Recieved for Event >>>>>>>>")
      console.log(JSON.stringify(payload, null, 2), "========> THIS IS PAYLOAD")
     
      switch (payload.eventData.eventName) {
        
        case "AddTenant":
          {
            return  callback({
              error:false,
              message:"AddTenant"
            })
            break;
          }
        case "Logout":
          {

          }
        case "UpdateToken":
          {

          }
       
          return "none"
        default:
        callback({
          error:true,
          message:"invalid case"
        })
        break;
      }
    }
    catch (err) {
      console.log(err)
    }
  }
  exports.handleSDGevents = handleSDGevents;


async function getPromise(payload, func, callback) {
  func().then(response => {
    console.log(payload.eventData.eventName + " Dispatched", body);
    callback({
      error: true,
      message: payload.eventData.eventName + " Dispatched",
      response: response
    })
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: false,
      message: payload.eventData.eventName + " Failed",
      response: err
    })
  });
}