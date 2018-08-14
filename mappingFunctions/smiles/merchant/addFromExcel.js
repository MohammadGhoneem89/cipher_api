'use strict';
var config = require('../../../Core/api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;


exports.addFromExcel = function (payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/merchant/item/excel';
    var options = {
        method: 'POST',
        uri: URL,
        body: payload,
        json: true // Automaticallvy stringifies the body to JSON
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



/*
viewSettlements({  "contractAddress":"0xefB08EA7690ABB57FC069617509a059Ec3672409",
"page":{
  "currentPageNo":1,
  "pageSize":10
}}, "", "", function (data) {
    console.log(data.orders)
}
    , "") */
