'use strict';

const notifications = require('../../../lib/services/notifications');

function viewed(payload, UUIDKey, route, callback, JWToken) {
    _markAsRead(payload, callback);
}

function _markAsRead(payload, callback) {
    let query = {
        _id: payload.data._id
    };

    notifications.markAsRead(query)
        .then((result) => {
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'OK',
                            errorDescription: 'Notification archived',
                            displayToUser: true
                        },
                        result
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
                            errorDescription: 'Notification not archived',
                            displayToUser: true
                        },
                        error: err
                    }
                }
            };
            callback(response);
        });
}

exports.viewed = viewed;

