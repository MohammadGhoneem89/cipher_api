/**
 * Created by abdullah on 4/17/18.
 */
'use strict';

const passwordPolicy = require('../../../lib/services/passwordPolicy');


function updatePasswordPolicy(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    get(payload, callback);
}

function get(payload, callback) {

    passwordPolicy.update(payload)
        .then((res) => {
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'password policy updated successfully',
                            displayToUser: true
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
                            errorDescription: 'password policy not updated',
                            displayToUser: true
                        },
                        error: err.stack || err
                    }
                }
            };
            callback(response);
        });
}

exports.updatePasswordPolicy = updatePasswordPolicy;

