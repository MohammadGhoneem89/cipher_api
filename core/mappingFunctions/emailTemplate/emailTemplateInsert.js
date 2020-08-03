'use strict';

const emailTemplate = require('../../../lib/services/emailTemplate');

function emailTemplateInsertOut(payload, UUIDKey, route, callback, JWToken) {
    payload.createdBy = JWToken._id;
    create(payload, callback);
}

function create(payload, callback) {
    emailTemplate.create(payload)
        .then((templateData) => {
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'Email Template inserted successfully',
                            displayToUser: true,
                            newPageURL: '/emailTemplateSearch'
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
                            errorDescription: 'Email Template name not inserted',
                            displayToUser: true
                        },
                        error: err
                    }
                }
            };
            callback(response);
        });
}

exports.emailTemplateInsertOut = emailTemplateInsertOut;

