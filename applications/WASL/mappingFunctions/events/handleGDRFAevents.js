
'use strict';
let rp = require('request-promise');

async function handleGDRFAevents(payload, UUIDKey, route, callback, JWToken) {

  try {
    console.log("<<<=Request Recieved for Event>>>")
    //onsole.log(JSON.stringify(payload.eventName, null, 2))

    switch (payload.eventName) {

      case "EventOnRequestKYCUpdate":
        {
          requestKYCDetail()
            .then(function (body) {
              // POST succeeded...
              console.log("EventOnRequestKYCUpdate dispatched", body)
            })
            .catch(function (err) {
              // POST failed...
              console.log("Error : ", err)

            });
          callback({
            error: false,
            message: "EventOnRequestKYCUpdate dispatched"
          })

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


