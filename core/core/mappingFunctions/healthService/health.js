'use strict';
const URL = "http://localhost:6000";
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

exports.health = function (payload, UUIDKey, route, callback, JWToken) {
    var options = {
        method: 'GET',
        uri: URL,
        json: true // Automatically stringifies the body to JSON
    };
    logger.info("The notification going is as follows" + JSON.stringify(payload))

    rp(options)
        .then(function (parsedBody) {
            logger.debug(JSON.stringify(parsedBody));
            logger.debug('==================== Sent Successfully==================');
            const response = {
                health:{
                  action: "health",
                  data: parsedBody
                }
              };
            callback(response);
        })
        .catch(function (err) {
            // POST failed...
            logger.debug('==================== Request Failed==================' + err);
            callback({
                responseMessage: {
                    action:'health',
                    data:{
                        message:{
                            status:'ERROR',
                            errorDescription: "Service not available",
                            displayToUser: true
                        },
                        error:err
                    }
                }
            })
        });
}

