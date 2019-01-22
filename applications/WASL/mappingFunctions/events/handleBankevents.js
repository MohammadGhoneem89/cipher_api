
'use strict';
async function handleBankevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<<<<<<< Request Recieved for Event >>>>>>>>")
    console.log(JSON.stringify(payload, null, 2), "========> THIS IS PAYLOAD")

    switch (payload.eventData.eventName) {

      case "ProcessInstrument":
        {
          return getPromise(payload,ProcessInstrument,callback)
        }
      case "AssociatePaymentInstruments":
        {

        }
      case "EventsOnProcessPaymentInstruments":
        {

        }
      case "UpdatePaymentInstrumentStatus":
        {
          return getPromise(payload,UpdatePaymentInstrumentStatus,callback)
        }
      case "EventOnUpdatePaymentStatus":
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
exports.handleBankevents = handleBankevents


function ProcessInstrument() {
  return Promise.resolve({
    methodName: "EventOnProcessPaymentInstrument",
    message: "DUMMY FUNCTION CALLED"
  });

  let options = {
    method: 'POST',
    url: 'http://51.140.250.28/API/PR/ProcessInstrument',

    body:
    {
      header:
      {
        username: 'waslapi',
        password: 'aa8dd29e572a64982d7d2bf48325a4951b7c399a1283fb33460ca275e230d5ae308dcd820d808c5ea0d23e047bd2f3e066bf402cb249d989408331566f7ca890'
      },
      body:
      {
        orgCode: 'WASL',
        contractID: 'DIRC932',
        paymentInstruments:
        {
          paymentMethod: '001',
          bankCode: 'EI',
          instrumentID: 'ECHEQUE0004',
          internalInstrumentID: '1b5745a0-1287-11e9-90bb-cb3b7eba35fe-3',
          date: '01/01/2018',
          amount: 20000,
          status: '005',
          bankMetaData: { MICR: '1111111111111', paymentID: 'ECHEQUE111', others: 'NA' }
        }
      }
    },
    json: true
  };
  return rp(options);
}
function UpdatePaymentInstrumentStatus(){}
async function getPromise(payload, func, callback) {
  func().then(response => {
    console.log(response, "RESPONSE");
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
      response: err
    })
  });
}