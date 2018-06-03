'use strict';
var config = require('../../../api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

function format(data){
    data.data = data.data.map(value=>{
        if(value.status===false){
            value.status = {type: "ERROR", value: "INACTIVE"};
        } else {
            value.status = {type: "OK", value: "ACTIVE"}
        }
        value['actions'] = [{
            actionType: "COMPONENT_FUNCTION",
            iconName: "fa fa-eye",
            label: "View more"
        }]
        return value;
    });
    return {
        action: 'Catalogue',
        catalogue: data
    }
}

exports.viewCatalogue = function(payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/catalogue';
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




