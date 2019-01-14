
'use strict';
async function getEvent(payload, UUIDKey, route, callback, JWToken) {
    try {
      console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Request Recieved for Event >>>>>>>>>>>>>>>>>>>>>>")
      console.log(JSON.stringify(payload.eventData,null,2))
     
      switch (payload.eventData.eventName) {
        
        case "GetContractData":
          {
            return  callback({
              error:false,
              message:"RenewContract"
            })
          }
        case "AssociatePaymentInstruments":
          {

          }
        case "EventsOnProcessPaymentInstruments":
          {

          }
        case "UpdatePaymentInstrumentStatus":
          {

          }
        case "EventOnUpdatePaymentStatus":
          {

          }
        
          return "&&&&&&&&&&&&&&&&&&7"
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
  exports.getEvent = getEvent
