'use strict';
var config = require('../../../api/connectors/smiles.json')
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;

function formatData(parsedBody) {
    let response = {
        Resolve: {
            data: {}
        }
    }

    if (parsedBody.success == true) {
        response.Resolve.data = {
            "message": {
                "status": "OK",
                "errorDescription": "Resolving Successfull",
                "displayToUser": true
            }
        };
    } else {
        response.Resolve.data = {
            "message": {
                "status": "ERROR",
                "errorDescription": "Resolving Failed",
                "displayToUser": true
            }
        };
    }
    return response;

}

exports.resolveEscrow = function (payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/merchant/resolveEscrow';
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
            let data = formatData(parsedBody);
            callback(data);
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
