'use strict';
let config = require('../../../config');
const grpcConfig = config.get('rpcQuorum');
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

exports.info = function (payload, UUIDKey, route, callback, JWToken) {
  const URL = grpcConfig + '/blockchain';
  let tranx = {
    "Header": {
      "userID": JWToken.quorrumUser,
      "network": payload.network
    },
    ...payload
  };
  console.log(URL);
  let options = {
    method: 'POST',
    uri: URL,
    body: tranx,
    json: true // Automatically stringifies the body to JSON
  };
  logger.info("The notification going is as follows" + JSON.stringify(payload));

  rp(options)
    .then(function (parsedBody) {
      logger.debug(JSON.stringify(parsedBody));
      logger.debug('==================== Sent Successfully==================');
      callback(parsedBody);
    })
    .catch(function (err) {
      // POST failed...
      logger.debug('==================== Request Failed==================' + err);
    });
};

