'use strict';
var config = require('../../../api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;

function format(data){
    data.data = data.data.map(value=>{
        const status = parseInt(value.status)||0;
        value.paymentDetails = JSON.parse(value.paymentDetails);
        if(status===0){
            value.completed = {type: "ERROR", value: "INCOMPLETE"}
            value.status={
                type: "ERROR",
                value: "PENDING"
            }
            value['actions'] = [{
                actionType: "COMPONENT_FUNCTION",
                iconName: "fa fa-cogs",
                label: "Complete Order"
            }]
        } else {
            value.completed = {type: "OK", value: "COMPLETE"}
            value.status={
                type: "SUCCESS",
                value: "COMPLETED"
            }
        }
        return value
    })
    return {
        action: 'Orders',
        orders: data
    }
}

exports.viewOrders = function(payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/merchant/orders';
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

