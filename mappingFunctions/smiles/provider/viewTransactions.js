'use strict';
var config = require('../../../Core/api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;
function format(data){
    data.data = data.data.map(value=>{
        const status = parseInt(value.status)||0;
            value['actions'] = [{
                actionType: "COMPONENT_FUNCTION",
                iconName: "fa fa-eye",
                label: "View More"
            }];
        return value
    })
    return {
        action: 'Transactions',
        transactions: data
    }
}

exports.viewTransactions = function (payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/getSettlementTransactions';
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
"settlementNumber":"1",
"page":{
  "currentPageNo":1,
  "pageSize":1
}}, "", "", function (data) {
    console.log(data.orders)
}
    , "") 
*/