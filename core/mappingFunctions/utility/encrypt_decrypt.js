'use strict';
const _ = require('lodash');
const crypto = require("../../../lib/helpers/crypto");

async function encrypt(payload, UUIDKey, route, callback, JWToken) {
    try {

        if (payload.data.data.hasOwnProperty('unecrypted_value')) {
            if (!_.isString(payload.data.data.unecrypted_value))
                throw new Error("invalid unecrypted_value!")
        }
        let value = _.trim(payload.data.data.unecrypted_value),
            encrypted_value = crypto.encrypt(value);

        const response = {
            encryptResponse: {
                action: payload.action,
                data: {
                    message: {
                        status: 'OK',
                        errorDescription: 'Encryption is done.',
                        displayToUser: true,
                        //newPageURL: '/cryptoUtillty',
                        encryptedValue: encrypted_value
                    }
                }
            }
        };

        callback(response);

    } catch (err) {
        const response = {
            encryptResponse: {
                action: payload.action,
                data: {
                    message: {
                        status: 'ERROR',
                        errorDescription: 'Encryption not done.',
                        displayToUser: true
                    },
                    error: err
                }
            }
        };
        callback(response);
    }
}
async function decrypt(payload, UUIDKey, route, callback, JWToken) {
    try {

        if (payload.data.data.hasOwnProperty('encrypted_value')) {
            if (!_.isString(payload.data.data.encrypted_value))
                throw new Error("invalid encrypted_value!")
        }

        let value = _.trim(payload.data.data.encrypted_value);
        let decrypted_value = crypto.decrypt(value);

        const response = {
            decryptResponse: {
                action: payload.action,
                data: {
                    message: {
                        status: 'OK',
                        errorDescription: 'Decryption is done.',
                        displayToUser: true,
                        //newPageURL: '/cryptoUtillty',
                        decryptedValue: decrypted_value
                    }
                }
            }
        };

        callback(response);

    } catch (err) {
        console.log(err)
        const response = {
            decryptResponse: {
                action: payload.action,
                data: {
                    message: {
                        status: 'ERROR',
                        errorDescription: 'Decryption not done.',
                        displayToUser: true
                    },
                    error: err
                }
            }
        };
        callback(response);
    }

}

exports.encrypt = encrypt;
exports.decrypt = decrypt;