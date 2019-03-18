'use strict';

const onBoarding = require('../../../lib/services/onBoarding');

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
                            errorDescription: 'On Boarding inserted successfully',
                            displayToUser: true,
                            newPageURL: '/onBoardingProfile'
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
                            errorDescription: 'On Boarding not inserted',
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

