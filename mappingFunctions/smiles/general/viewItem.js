'use strict';
var config = require('../../../api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;
const category = [
    "New Offers",
    "Trending Offers",
    "Shopping Offers",
    "Dining Offers",
    "Entertainment Offers",
    "Wellness Offers",
    "Travel Offers",
    "Etisalat Services",
    "Financial",
    "Other",
    "Shopping"
];

function format(data) {
    data.category = category[data.category];
    return {
        action: 'viewItem',
        viewItem: data
    }
}

exports.viewItem = function (payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/item';
    var options = {
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
            const formattedData = format(parsedBody);
            callback(formattedData);
        })
        .catch(function (err) {
            // POST failed...
            logger.debug('==================== Request Failed==================' + err);
        });
}




