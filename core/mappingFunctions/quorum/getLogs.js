'use strict';
let config = require('../../api/connectors/quorum.json');
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

exports.getLogs = function (payload, UUIDKey, route, callback, JWToken) {

    let URL = config['host'] + '/contract/logs';
    let options = {
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
            let data = [];
            parsedBody.forEach(element => {
                data.push({
                    blockNumber: element.blockNumber,
                    transactionHash: element.transactionHash,
                    event: element.event,
                    values: element.returnValues,
                    actions: [
                        {
                            "label": "View",
                            "iconName": "fa fa-eye",
                            "actionType": "COMPONENT_FUNCTION",
                            "params":""
                        }
                    ]
                })
            })
            const response = {
                contractLogs: {
                    action: 'contractLogs',
                    data: data
                }
            }
            callback(response);
        })
        .catch(function (err) {
            // POST failed...
            logger.debug('==================== Request Failed==================' + err);
        });
}

