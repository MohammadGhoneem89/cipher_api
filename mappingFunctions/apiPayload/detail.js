'use strict';

const apiPayload = require('../../lib/services/apiPayload');

function detail(payload, UUIDKey, route, callback, JWToken) {
    payload.userID = JWToken._id;
    _detail(payload, callback);
}

function _detail(payload, callback) {
    apiPayload.getDetails(payload)
        .then((detail) => {
            let response = {};
            response[payload.action] = {
                action: payload.action,
                data: detail
            };
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.detail = detail;

