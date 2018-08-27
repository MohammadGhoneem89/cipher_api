'use strict';

const emailTemplate = require('../../../lib/services/emailTemplate');

function get(payload, UUIDKey, route, callback, JWToken) {
	payload.userId = JWToken._id;
    emailTemplateDetail(payload, callback);
}

function emailTemplateDetail(payload, callback) {
    emailTemplate.getDetails(payload)
        .then((templateData) => {
           const response = {
                emailTemplateDetail: {
                    action: payload.action,
                    data: templateData.data
                }
            };
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.get = get;

