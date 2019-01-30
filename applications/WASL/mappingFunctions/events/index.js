'use strict';
let rp = require('request-promise');
let handlePMevent = require('./handlePMevents');

async function generalEventHandler(payload, UUIDKey, route, callback, JWToken) {
  console.log(payload,"+++++++++++++++++++++++++++++++++")
  
  handlePMevent(payload, route, callback, JWToken)
  .callback({
    message: payload.eventName + " Dispatched",
  })

}
exports.generalEventHandler = generalEventHandler;