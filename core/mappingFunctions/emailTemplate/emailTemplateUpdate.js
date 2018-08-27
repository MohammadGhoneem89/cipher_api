'use strict';

const emailTemplate = require('../../../lib/services/emailTemplate');
const dates = require('../../../lib/helpers/dates');

function emailTemplateUpdateOut(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    payload.updatedAt = dates.now;
    emailTemplateUpdate(payload, callback);
}

function emailTemplateUpdate(payload, callback) {
    emailTemplate.update(payload)
        .then((templateData) => {
            let message = {};
            if(!templateData){
                message = {
                    status: 'ERROR',
                    errorDescription: 'Email Template not Updated',
                    displayToUser: true
                }
            }
            else{
                message = {
                    status: 'OK',
                    errorDescription: 'Email Template Updated Successfully',
                    displayToUser: true,
                    newPageURL: '/emailTemplateSearch'
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
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'ERROR',
                            errorDescription: 'Email Template not Updated',
                            displayToUser: true
                        },
                        error: err
                    }
                }
            };
            callback(response);
        });
}

exports.emailTemplateUpdateOut = emailTemplateUpdateOut;

