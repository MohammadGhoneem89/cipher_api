'use strict';
var config = require('../../../api/connectors/smiles.json')
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
function format(data) {
    data.data = data.data.map(value => {
        value['actions'] = [{
            actionType: "COMPONENT_FUNCTION",
            iconName: "fa fa-cogs",
            label: "View Transactions"
        }];

        return value
    })
    return {
        action: 'completedSettlements',
        completedSettlements: data
    }
}

exports.viewCompletedSettlements = function (payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/provider/completedSettlements';
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



/*
viewSettlements({  "contractAddress":"0xefB08EA7690ABB57FC069617509a059Ec3672409",
"page":{
  "currentPageNo":1,
  "pageSize":10
}}, "", "", function (data) {
    console.log(data.orders)
}
    , "") */
