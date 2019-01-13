'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;

exports.events = function (payload, UUIDKey, route, callback, JWToken) {
  console.log(JSON.stringify(payload));

  let x = {
    error: true,
    message: "stop dispatch!!!"
  };
  callback(x);
};

