'use strict';

const apiPayload = require('../../../lib/services/apiPayload');

function replay(payload, UUIDKey, route, callback, JWToken) {
    payload.userID = JWToken._id;
    _replay(payload, callback);
}

function _replay(payload, callback) {
    apiPayload.replayList(payload)
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

exports.replay = replay;

