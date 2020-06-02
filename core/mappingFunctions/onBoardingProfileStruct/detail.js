'use strict';

const onBoarding = require('../../../lib/services/OnBoardingProfileStruct');

function detail(payload, UUIDKey, route, callback, JWToken) {
    onBoardingDetail(payload, callback);
}

function onBoardingDetail(payload, callback) {
    onBoarding.getDetails(payload)
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

