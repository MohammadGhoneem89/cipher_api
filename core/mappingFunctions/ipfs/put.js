'use strict';
let config = require('../../api/connectors/ipfs.json');
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

exports.put = function (payload, UUIDKey, route, callback, JWToken) {
    const URL = config['host'] + '/put';
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
                IPFS_Put: {
                    action: 'IPFS_Put',
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






