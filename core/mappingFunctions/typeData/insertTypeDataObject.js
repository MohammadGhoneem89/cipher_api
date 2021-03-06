'use strict';
console.log(" ------- PAYLOAD")
const typeData = require('../../../lib/services/typeData');
console.log(" ------- PAYLOAD")

function insertTypeDataObject(payload, UUIDKey, route, callback, JWToken) {
    console.log(payload," ------- PAYLOAD")
    payload.userId = JWToken._id;
    get(payload, callback);
}

function get(payload, callback) {
    typeData.insertTypeData(payload)
        .then((typeData) => {
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'typeData inserted successfully',
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
                            errorDescription: 'typeData not inserted',
                            displayToUser: true
                        },
                        error: err.stack || err
                    }
                }
            };
            callback(response);
        });
}

exports.insertTypeDataObject = insertTypeDataObject;

