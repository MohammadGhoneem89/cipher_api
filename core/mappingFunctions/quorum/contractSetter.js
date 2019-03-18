'use strict';
let config = require('../../../config');
const grpcConfig = config.get('rpcQuorum')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

exports.contractSetter = function (payload, UUIDKey, route, callback, JWToken) {
    const URL = grpcConfig + '/contract/'+payload['address']+'/set/'+payload['functionName'];
    console.log(payload);
    let options = {
        method: 'POST',
        uri: URL,
        body: payload,
        json: true // Automatically stringifies the body to JSON
    };
    logger.info("The notification going is as follows" + JSON.stringify(payload));

    rp(options)
        .then(function (parsedBody) {
            logger.debug(JSON.stringify(parsedBody));
            logger.debug('==================== Sent Successfully==================');
            parsedBody.message = {
                status: 'OK',
                errorDescription: payload['functionName']+' method execution successful',
                displayToUser: true
              }
            const response = {
                contractSetter: {
                    action: 'contractSetter',
                    data: parsedBody
                }
            }
            console.log(response)
            callback(response);
        })
        .catch(function (err) {
            // POST failed...
            logger.debug('==================== Request Failed==================' + err);
        });
}






