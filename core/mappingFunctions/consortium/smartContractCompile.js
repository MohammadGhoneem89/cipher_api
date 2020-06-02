'use strict';
const consortium = require("../../../lib/services/consortium");
const logger = require('../../../lib/helpers/logger')().app;

function smartContractCompile(payload, UUIDKey, route, callback, JWToken) {
    logger.debug(' [ Smart Contract Compile ] Payload : ' + JSON.stringify(payload));

    payload.deployedBy = JWToken._id;
    consortium.smartContractCompile(payload).then(response => {
        response.consortiumDetail.data.message = {
            status: 'OK',
            errorDescription: 'Template Inserted Successfully',
            displayToUser: true
        }
        callback(response);
    }).catch((err) => {
        logger.debug(' [ Smart Contract Compile ] Error : ' + err);
        const response = {
            responseMessage: {
                action: payload.action,
                data: {
                    message: {
                        status: 'ERROR',
                        errorDescription: 'Smartcontract not compiled',
                        displayToUser: true
                    },
                    error: err
                }
            }
        };
        callback(response);
    });
}

exports.smartContractCompile = smartContractCompile;