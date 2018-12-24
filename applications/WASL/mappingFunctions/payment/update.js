'use strict';

const payment = require('../../../../lib/services/payment');
const dates = require('../../../../lib/helpers/dates');

function update(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    payload.updatedAt = dates.now;
    paymentUpdate(payload, callback);
}

function paymentUpdate(payload, callback) {
    payment.update(payload)
        .then((calendarData) => {
            let message = {};
            if(!calendarData){
                message = {
                    status: 'ERROR',
                    errorDescription: 'Payment not Updated',
                    displayToUser: true
                }
            }
            else{
                message = {
                    status: 'OK',
                    errorDescription: 'Payment Updated Successfully',
                    displayToUser: true,
                    newPageURL: '/paymentSearch'
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
                            errorDescription: 'Payment not Update',
                            displayToUser: true
                        },
                        error: err
                    }
                }
            };
            callback(response);
        });
}

exports.update = update;

