'use strict';
var config = require('../../../api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

function formatData(data) {
    data = data.map(value => {
        value.value = value.contractAddress;
        return value;
    });
    return {
        "contracts": {
            "data": data
        }
    };
}

exports.getContractAddresses = function (payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/other/getAll';
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
            const formattedData = formatData(parsedBody);
            callback(formattedData);
        })
        .catch(function (err) {
            // POST failed...
            logger.debug('==================== Request Failed==================' + err);
        });


}




