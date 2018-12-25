'use strict';

const payment = require('../../lib/services/payment');

function create(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    paymentCreate(payload, callback);
}

function paymentCreate(payload, callback) {
    payment.create(payload)
        .then((calendarData) => {
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'Payment inserted successfully',
                            displayToUser: true,
                            newPageURL: '/paymentSearch'
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
                            errorDescription: 'Payment not inserted',
                            displayToUser: true
                        },
                        error: err
                    }
                }
            };
            callback(response);
        });
}

exports.create = create;

