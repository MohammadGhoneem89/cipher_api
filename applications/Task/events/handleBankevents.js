'use strict';
let rp = require('request-promise');
const transformTemplate = require('../../../../lib/helpers/transformTemplate');

async function handleBankevents(payload, UUIDKey, route, callback, JWToken) {
  try {
    console.log("<<<<<<<<< Request Recieved for Event >>>>>>>>");
    console.log(JSON.stringify(payload, null, 2), "========> THIS IS PAYLOAD");

    switch (payload.eventData.eventName) {
      case "RenewContract": {
        console.log("============RenewContract===================>", payload, "<============RenewContract===================");
        break;
      }

      case "ProcessInstrument": {
        return getPromise(payload, ProcessInstrument, callback)
      }
      case "AssociatePaymentInstruments": {
        break;
      }
      case "EventsOnProcessPaymentInstruments": {
        break;
      }
      case "UpdatePaymentInstrumentStatus": {
        try {
          //await UpdateContractStatus(payload);
          await getPromise(payload, updatePaymentStatus(payload), callback);
        } catch (e) {
          console.log(e);
        }
        break;
      }

      case "EventOnUpdatePaymentStatus": {
        break;
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
                bankMetaData: {MICR: '1111111111111', paymentID: 'ECHEQUE111', others: 'NA'}
              }
          }
      },
    json: true
  };
  return rp(options);
}

function updatePaymentStatus(payload) {
  console.log("PAYLOADY=====================> ", payload.eventData, " <=====================PAYLOADY");


  return async () => {
    console.log("OUTPUT=====================> ", await transformTemplate("EventOnUpdatePaymentStatus", payload.eventData, []), " <=====================OUTPUT");
    let options = {
      method: 'POST',
      url: 'https://ecservicesqa.wasl.ae/sap/bc/zblckchain?eventName=paymentStatus',
      body:
        {
          header:
            {
              username: 'api_user',
              password: '2c4e9365c231754b208647854e1f608b8db6014d8a28c02a850162963f28ca5b'
            },
          body: await transformTemplate("EventOnUpdatePaymentStatus", payload.eventData, [])
          // body: EventOnUpdateFirstPaymentStatus

        },
      json: true
    };
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);
  }

}

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