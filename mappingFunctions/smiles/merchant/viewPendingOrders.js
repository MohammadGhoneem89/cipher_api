'use strict';
var config = require('../../../api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

function format(data) {
    data.data = data.data.map(value => {
        const status = parseInt(value.status) || 0;
        value.paymentDetails = JSON.parse(value.paymentDetails);

        value['actions'] = [{
            actionType: "COMPONENT_FUNCTION",
            iconName: "fa fa-cogs",
            label: "Complete Order"
        }]

        return value;
    })
    return {
        action: 'PendingOrders',
        orders: data
    }
}

exports.viewPendingOrders = function (payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/merchant/pendingOrders';
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

