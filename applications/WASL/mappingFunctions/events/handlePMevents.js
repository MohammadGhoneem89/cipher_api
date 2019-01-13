
'use strict';
async function getEvent(payload, UUIDKey, route, callback, JWToken) {
    try {
      console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Request Recieved for Event >>>>>>>>>>>>>>>>>>>>>>")
      console.log(JSON.stringify(payload.eventData,null,2))
     
      switch (payload.eventData.eventName) {
        
        case "RenewContract":
          {
            return  callback({
              error:false,
              message:"RenewContract"
            })
          }
        case "UpdateContract":
          {

          }
        case "GetContractDetails ":
          {

          }
        case "EventOnUpdateFirstPaymentStatus":
          {

          }
        case "EventOnUpdatePaymentStatus":
          {

          }
        case "EventOnEjariAvailable":
          {

          }
        case "ReplacePaymentInstruments":
          {

          }
        case "ReplacePaymentInstrumentsBackOffice":
          {

          }
        case "TerminateContract":
          {

          }
        case "EventOnTerminateContract":
          {

          }
        case "ReprocessEjari":
          {

          }
        case "GetKYCDetail":
          {

          }
        case "EventOnUpdateKYCDetail":
          {

          }
        case "GetInstrumentList":
          {

          }
          return "&&&&&&&&&&&&&&&&&&"
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
