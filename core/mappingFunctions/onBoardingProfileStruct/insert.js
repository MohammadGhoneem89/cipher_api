'use strict';

const onBoarding = require('../../../lib/services/OnBoardingProfileStruct');

function create(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    onBoardingCreate(payload, callback);
}

function onBoardingCreate(payload, callback) {
    onBoarding.create(payload)
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

