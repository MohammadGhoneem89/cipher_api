'use strict';
let config = require('../../api/connectors/quorum.json');
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

exports.deployContract = function (payload, UUIDKey, route, callback, JWToken) {
    const URL = config['host'] + '/contract/deploy';

    let options = {
        method: 'POST',
        uri: URL,
        body: payload,
        json: true // Automatically stringifies the body to JSON
    };
    logger.info("The notification going is as follows" + JSON.stringify(payload))

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
}






