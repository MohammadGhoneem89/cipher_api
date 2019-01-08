
'use strict';
function getEvent(payload, callback) {
    console.log(payload, "IQRA");
    let resp = {
      "getEvent": {
        "action": "getEvent",
        "data": {
          "message": {
            "status": "ERROR",
            "errorDescription": " Event not Found!!",
            "displayToUser": true,
            "newPageURL": ""
          }
        }
      }
    };
    if (!payload.EventName) {
      return callback(resp);
    }
    APIDefinitation.getEvent(payload).then((data) => {
      if (data) {
        console.log(data,"DDDDDDDDAAAAAAAAAATTTTTTTTTTTAAAAAAAAAA")
       // func CheckEvent(eventName string) string {
          switch (data.eventName) {
          case "RenewContract":
            {
        
            }
          case "UpdateContract":
            {
        
            }
          case "TerminateContract":
            {
        
            }
          case "ReprocessEjari":
            {
        
            }
          case "ReplacePaymentInstrumentsBackOffice":
            {
        
            }
          case "ReplacePaymentInstruments":
            {
        
            }
          case "InsertPaymentMetaInfo":
            {
        
            }
          case "ProcessInstrument":
            {
        
            }
          case "RequestKYC":
            {
        
            }
          case "GetContractDetails":
            {
        
            }
          case "GetKYCDetail":
            {
        
            }
          case "UpdateDEWADetail":
            {
        
            }
          case "SaveEjariHashData":
            {
        
            }
          case "EjariTerminationStatus":
            {
        
            }
          case "GetContractDataForEjari":
            {
        
            }
          case "GetBouncedCheque":
            {
        
            }
          case "UpdateKYCDetail":
            {
        
            }
          case "UpdatePaymentInstrumentStatus":
            {
        
            }
          case "AssociatePaymentInstruments":
            {
        
            }
          case "GetContractData":
            {
        
            }
          case "AddTenant":
            {
        
            }
          case "Logout":
            {
        
            }
          case "UpdateToken":
            {
        
            }
          case "GetDataByKey":
            {
        
            }
        
          }
          callback(data);
          //return eventName
      }
  
    }).catch((err) => {
      callback(err);
    });
  }
  exports.getEvent= getEvent;