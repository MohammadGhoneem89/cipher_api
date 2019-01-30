'use strict';

let handlePMevent = require('./handlePMevents');
async function generalEventHandler(payload, UUIDKey, route, callback, JWToken) {
  console.log(payload)
  handlePMevent(payload, route, callback, JWToken);

}
