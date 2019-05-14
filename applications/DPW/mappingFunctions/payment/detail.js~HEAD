'use strict';

const payment = require('../../lib/services/payment');

function detail(payload, UUIDKey, route, callback, JWToken) {
    paymentDetail(payload, callback);
}

function paymentDetail(payload, callback) {
    payment.getDetails(payload)
        .then((paymentData) => {
            const response = {
                getPaymentDetail: {
                    action: payload.action,
                    data: paymentData
                }
            };
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.detail = detail;

