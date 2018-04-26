'use strict';

const consortium = require('../../lib/services/consortium');
const commissionPolicy = require('../getCommissionPolicy');
const dates = require('../../lib/helpers/dates');
const logger = require('../../lib/helpers/logger')().app;

function consortiumUpdate(payload, UUIDKey, route, callback, JWToken){
    payload.userId = JWToken._id;
    payload.updatedAt = dates.newDate();
    Update(payload,callback);
}

function Update(payload, callback) {
    logger.debug(' [ Consortium Update ] Payload : ' + JSON.stringify(payload));

    consortium.update(payload)
        .then((templateData) => {
            let message = {};
            if(!templateData){
                message = {
                    status: 'ERROR',
                    errorDescription: 'Consortium not Updated',
                    displayToUser: true
                }
            }
            else{
                message = {
                    status: 'OK',
                    errorDescription: 'Consortium Updated Successfully',
                    displayToUser: true,
                    newPageURL: '/consortiumSearch'
                }
            }
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: message
                    }
                }
            };
            callback(response);
        })
        .catch((err) => {
            logger.error(' [ Consortium Update ] Error : ' + err);

            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'ERROR',
                            errorDescription: err.template || 'Consortium not Updated',
                            displayToUser: true
                        },
                        error: err
                    }
                }
            };
            callback(response);
        });
}

exports.consortiumUpdate = consortiumUpdate;

