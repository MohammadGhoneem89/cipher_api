'use strict';

const onBoarding = require('../../../lib/services/OnBoardingProfileStruct');
const dates = require('../../../../lib/helpers/dates');

function update(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    payload.updatedAt = dates.now;
    onBoardingUpdate(payload, callback);
}

function onBoardingUpdate(payload, callback) {
    onBoarding.update(payload)
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

