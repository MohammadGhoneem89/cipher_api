
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
  exports.handleSDGevents = handleSDGevents
