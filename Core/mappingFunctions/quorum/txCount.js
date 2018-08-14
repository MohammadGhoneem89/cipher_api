'use strict';
let config = require('../../api/bootstrap/quorum.json');
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

exports.txCount = function (payload, UUIDKey, route, callback, JWToken) {
    
    let URL = config['host'] + '/blockchain/block/' + payload['blockNumber'] + '/count';
    let options = {
        method: 'GET',
        uri: URL,
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

