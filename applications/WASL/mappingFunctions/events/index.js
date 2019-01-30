'use strict';
let rp = require('request-promise');
let handlePMevent = require('./handlePMevents');

async function generalEventHandler(payload, UUIDKey, route, callback, JWToken) {
  console.log(payload,"+++++++++++++++++++++++++++++++++")
  callback({
    message: payload.eventData.eventName + " Dispatched",
  })
  //handlePMevent(payload, route, callback, JWToken);

}
exports.generalEventHandler = generalEventHandler;