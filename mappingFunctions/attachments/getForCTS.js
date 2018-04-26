'use strict';

const attachment = require('../../lib/services/attachment');

function getAttachments(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    _getAttachments(payload, callback);
}

function _getAttachments(payload, callback) {
    attachment.getForCTS(payload)
        .then((details) => {
            const response = {};
            response[payload.action]={
                action: payload.action,
                data: details
            };
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.getAttachments = getAttachments;

