
'use strict';
let rp = require('request-promise');
const comparisonFunction = require('./comparison');
const config = require('../../../../config');

const _ = require('lodash')
const transformTemplate = require('../../../../lib/helpers/transformTemplate');


//config = global.config
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
          await getPromise(payload, eventOnContainerStatusChange(payload, deltaData), callback);
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
              await associateAliasFromCustID(payload, await createApproveRegistration(payload), callback)
            } catch (e) {
              console.log(e);
              return e;
            }
            break;
            //1-  call createApproveReg
            //2-  let globalID=reponse.globalID
          }
        }
      case "EventOnDataChangeForREGAUTH":
        {
          if (payload.eventData.status == "AW_TERM") {
            try {
              await endRegistration(payload,callback)
            } catch (e) {
              console.log(e);
              return e
            }
            break;
            //1-  call ENDREG
          }
          else {
            try {
               await updateRegistration(payload,callback);
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
async function createApproveRegistration(payload) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD");


    let options = {
      method: 'POST',
      // url: `${url}API/PR/UpdateContractStatus`,
      url: payload.endpoint.address,
      json: false,
      body: await transformTemplate(payload.template.data, payload.eventData, [])
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return options;
  
}

async function  updateRegistration(payload,callback) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD",
    payload.eventData.status, "<<<<<<<<<payload status");

    var edata={}
    edata.accountNumber=payload.eventData.accountNumber;
    var newBuissnessName= _.get(payload.eventData, "accountNameEn", "")
    var oldBuissnessName= _.get(payload.eventData, "oldData.accountNameEn","")
    console.log("new Buissness Name"+newBuissnessName+" old buissness name "+oldBuissnessName)
    var aliasArray= _.get(payload.eventData, "aliasList", [])
    console.log("alias array"+aliasArray)
    if(newBuissnessName!="" && oldBuissnessName!="" && newBuissnessName!=oldBuissnessName){
      edata.buissnessName=newBuissnessName;
  
     edata.custId=getCustId(aliasArray) 
   
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      url: payload.endpoint.address,
      body: await transformTemplate(payload.template.data, edata),
      json: false
    };

  
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    getPromise2(payload,options,callback)
  }


}

function associateAlias(payload, globalCustId) {
  //console.log("PAYLOAD=====================> ",
   // payload.eventData, " <=====================PAYLOAD");

      console.log("OUTPUT========================OUTPUT");
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    console.log("url ==>"+config.get('eventService.AssociateAliasURL'))
    let options = {
      method: 'POST',
      // url: `${url}API/PR/associateAlias`,
      url: config.get('eventService.AssociateAliasURL'), //its comming in vault
      body:
      {
        header: config.get('eventService.Avanza_ISC') || { //assigned permission to internal group
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
    return options;
  
}

async function  endRegistration(payload,callback) {
  console.log("PAYLOAD=====================> ",
    payload.eventData, " <=====================PAYLOAD",
    payload.eventData.status, "<<<<<<<<<payload status");



    var edata={}
    edata.accountNumber=payload.eventData.accountNumber;
    var newstatus= _.get(payload.eventData, "status", "")
    var oldstatus= _.get(payload.eventData, "oldData.status","")
    console.log("new status  "+newstatus+" old status name "+oldstatus)
    var aliasArray= _.get(payload.eventData, "aliasList", [])
    console.log("alias array"+aliasArray)
    if(newstatus!="" && oldstatus!="" && newstatus!=oldstatus){
     
     edata.custId=getCustId(aliasArray)    
    console.log("OUTPUT========================OUTPUT");
    //let url = config.get('URLRestInterface') || "http://0.0.0.0/";
    let options = {
      method: 'POST',
      // url: `${url}API/PR/UpdateContractStatus`,
      url: payload.endpoint.address,
      body: await transformTemplate(payload.template.endRegData, edata, []),
      json: false
    };

  
    

    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    getPromise2(payload,options,callback)
  
}
}




function getCustId(aliasArray){
  var filterList = aliasArray.filter(function(x){console.log("el  "+x); return x!=undefined && x!=null && x.includes("TRADE_") })
     console.log(filterList)
     return filterList != undefined || filterList.length != 0?filterList[0].replace("TRADE_",""):0
    
}


async function associateAliasFromCustID(payload, message, callback) {
  rp(message).then(response => {
    console.log("------------response-----------------", response)


if(response.includes("<sch:exception>")){

  callback({
    error: true,
    message: "Exception in response payload",
    response: {
      "request":message,
      "response":response
    }
  })
}else if (response.includes("SUCCESS") ) {
  var globalCustid=response.substring(response.indexOf("<sch:globalCustId>")+18, response.lastIndexOf("globalCustId>")-6)
  console.log("global Custid "+globalCustid)
      getPromiseForCreate(payload,message,response, associateAlias(payload, globalCustid), callback)
    }
    else {
      callback({
        error: true,
        message: "SUCCESS",
        response: {
          "request":message,
          "response":response
        }
      })
    }
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: true,
      message: err.name,
      response: {
        "request":message,
        "response":err
      }
    })
  });
}

async function getPromiseForCreate(payload,requestsoap,responsesoap, options, callback) {
  rp(options).then(response => {
    console.log(response, "RESPONSE");
    _.set(options.body, 'header.password', "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    callback({
      error: response.errorCode == 200 ? false : true,
      message: response.errorCode == 200 ? payload.eventData.eventName + " Dispatched" : "Internal Error. " + response.errorDescription,
      response: {
        "soap Request":requestsoap , 
        "soap Response":responsesoap,
        "request":options,
        "response":response
        }
    })
  }).catch(err => {
    console.log("error : ", err);
    _.set(options.body, 'header.password', "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    callback({
      error: true,
      message: "Internal Error. " + err.name,
      response: {
      "soap Request":requestsoap , 
      "soap Response":responsesoap,
      "request":options,
      "response":err
      }
    })
  });
}

async function getPromise(payload, func, callback) {
  func().then(response => {
    console.log("response===============>", response, "<==========response");
  
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


async function getPromise2(payload, request, callback) {
  rp(request).then(response => {
    console.log("response===============>", response, "<==========response");
  
    callback({
      error: response.includes("SUCCESS") ? false : true,
      message: response.includes("SUCCESS")  ? payload.eventData.eventName + " Dispatched" : "Failed",
      response: {
        "reqeust":request,
        "response":response
      }
    })
  }).catch(err => {
    console.log("error : ", err);
    callback({
      error: true,
      message: err.name,
      //request: message.body,
      response: {
        "reqeust":request,
        "response":err
      }
    })
  });
}

async function getPromiseWithOrgCode(payload,orgCode,orgCode1, func, callback) {
  func(payload,orgCode,orgCode1).then(response => {

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