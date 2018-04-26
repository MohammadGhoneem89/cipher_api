'use strict';
const consortium = require("../../lib/services/consortium");
const logger = require('../../lib/helpers/logger')().app;

function contractStructFetcher(payload, UUIDKey, route, callback, JWToken) {
    logger.debug(' [ Contract Strucuture Fetcher ] Payload : ' + JSON.stringify(payload));
    payload.deployedBy = JWToken._id;
    consortium.getContractStruct(payload).then(response => {
        callback(response);
    }).catch((err) => {
        logger.debug(' [ Contract Strucuture Fetcher ] Error : ' + err);

        console.error(err);
        const response = {
            responseMessage: {
                action: payload.action,
                data: {
                    message: {
                        status: 'ERROR',
                        errorDescription: 'Structure not fetched',
                        displayToUser: true
                    },
                    error: err
                }
            }
        };
        callback(response);
    });
}

exports.contractStructFetcher = contractStructFetcher;
//