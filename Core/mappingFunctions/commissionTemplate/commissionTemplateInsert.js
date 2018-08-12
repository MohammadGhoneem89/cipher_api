'use strict';

const commissionTemplate = require('../../../lib/services/commissionTemplate');
const commissionRepo = require("../../../lib/repositories/commissionTemplate");

function commissionTemplateInsert(payload, UUIDKey, route, callback, JWToken) {
    payload.createdBy = JWToken._id;
    create(payload, callback);
}

function create(payload, callback) {
    commissionTemplate.create(payload)
        .then((templateData) => {
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'Commission Template inserted successfully',
                            displayToUser: true,
                            newPageURL: '/commissionTemplateSearch'
                        }
                    }
                }
            };

            callback(response);
        })
        .catch((err) => {
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'ERROR',
                            errorDescription: err.template || 'Commission Template not inserted',
                            displayToUser: true
                        },
                        error: err
                    }
                }
            };
            callback(response);
        });
}

exports.commissionTemplateInsert = commissionTemplateInsert;

