'use strict';
var config = require('../../../api/connectors/smiles.json')
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;

function format(data, contractAddress){
    data.data.points['actions']=[{
        actionType: "COMPONENT_FUNCTION",
        iconName: "fa fa-cogs",
        label: "Request Settlement"
    }];
    data.data.points['name']='Smiles';
    data.data.points['contractAddress'] = contractAddress;
    return {
        action: 'Points',
        points:{ data:[data.data.points]
        }
    }
}

exports.viewPoints = function(payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/points';
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
            const formattedData = format(parsedBody, payload['contractAddress']);
            callback(formattedData);
        })
        .catch(function (err) {
            // POST failed...
            logger.debug('==================== Request Failed==================' + err);
        });
}