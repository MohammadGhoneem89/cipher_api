'use strict';
var config = require('../../../api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

function formatData(parsedBody) {
    let response = {
        SettlementResponse: {
            data: {}
        }
    }

    if (parsedBody.success == true) {
        response.SettlementResponse.data = {
            "message": {
                "status": "OK",
                "errorDescription": "Settlement Successfull",
                "displayToUser": true
            }
        };
    } else {
        response.SettlementResponse.data = {
            "message": {
                "status": "OK",
                "errorDescription": "Settlement Failed",
                "displayToUser": true
            }
        };
    }
    return response;

}

exports.settle = function (payload, UUIDKey, route, callback, JWToken) {
    let URL = config['host'] + '/provider/settle';
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
            let formattedData = formatData(parsedBody)
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
