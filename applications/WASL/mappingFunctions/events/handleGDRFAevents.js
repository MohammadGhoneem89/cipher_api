
'use strict';
let rp = require('request-promise');

async function handleGDRFAevents(payload, UUIDKey, route, callback, JWToken) {

  try {
    console.log("<<<=Request Recieved for Event>>>")
    console.log(JSON.stringify(payload, null, 2), "========> THIS IS PAYLOAD")

    switch (payload.eventData.eventName) {

      case "EventOnRequestKYCUpdate":
        {
          return getPromise(payload,requestKYCDetail,callback)   
        }
      
      default:
        callback({
          error: true,
          message: "invalid case"
        })
        break;
    }
  }
  catch (err) {
    console.log(err)
  }
}
exports.handleGDRFAevents = handleGDRFAevents


function requestKYCDetail() {
  let options = {
    method: 'POST',
    url: 'http://51.140.250.28/API/PR/RequestKYC',
    body:
    {
      header:
      {
        username: 'waslapi',
        password: 'aa8dd29e572a64982d7d2bf48325a4951b7c399a1283fb33460ca275e230d5ae308dcd820d808c5ea0d23e047bd2f3e066bf402cb249d989408331566f7ca890'
      },
      body: { orgCode: 'WASL', EIDA: '784-1984-1234567-7' }
    },
    json: true
  };

  return rp(options);

}

async function getPromise(payload,func,callback){
  func().then(function(body) {
    console.log(payload.eventName+ " dispatched", body)
  }).catch(function (err) {
    console.log("error : ", err)
  })
  callback({
    error: true,
    message: payload.eventName +" dispatched"
  })
}
