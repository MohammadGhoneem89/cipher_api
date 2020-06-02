'use strict';
let config = require('../../api/connectors/ipfs.json');
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

exports.info = function (payload, UUIDKey, route, callback, JWToken) {

    let URL = config['host'] + `/info/${payload.hash}`;
    console.log(URL)
    let options = {
        method: 'GET',
        uri: URL
    };
    logger.info("The notification going is as follows" + JSON.stringify(payload))

    rp(options)
        .then(function (parsedBody) {
            logger.debug(JSON.stringify(parsedBody));
            logger.debug('==================== Sent Successfully==================');

            callback({
                info: {
                    action: 'info',
                    data: JSON.parse(parsedBody)
                }
            });
        })
        .catch(function (err) {
            // POST failed...
            logger.debug('==================== Request Failed==================' + err);
        });
}

