'use strict';

const commissionTemplate = require('../../lib/services/commissionTemplate');
const consortium = require("../../../lib/services/consortium");
const logger = require('../../../lib/helpers/logger')().app;

function consortiumInsert(payload, UUIDKey, route, callback, JWToken) {
    payload.createdBy = JWToken._id;
    create(payload, callback);
}

function create(payload, callback) {
    logger.debug(' [ Consortium Insert ] Payload : ' + JSON.stringify(payload));
    consortium.create(payload)
        .then((templateData) => {
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'Consortium inserted successfully',
                            displayToUser: true,
                            newPageURL: '/consortiumSearch'
                        }
                    }
                }
            };

            callback(response);
        })
        .catch((err) => {
            logger.error(' [ Consortium Insert ] Error : ' + err);
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'ERROR',
                            errorDescription: 'Consortium not inserted',
                            displayToUser: true
                        },
                        error: err
                    }
                }
            };
            callback(response);
        });
}

exports.consortiumInsert = consortiumInsert;

