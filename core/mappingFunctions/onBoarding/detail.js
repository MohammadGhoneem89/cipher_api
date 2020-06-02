'use strict';

const onBoarding = require('../../../lib/services/onBoarding');

function detail(payload, UUIDKey, route, callback, JWToken) {
    onBoardingDetail(payload, callback);
}

function onBoardingDetail(payload, callback) {
    onBoarding.getDetails(payload)
        .then((paymentData) => {
            const response = {
                getOnBoardingProfileDetail: {
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

