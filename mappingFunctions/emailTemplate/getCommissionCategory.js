'use strict';

const typeData = require('../../lib/services/typeData');

function get(payload, UUIDKey, route, callback, JWToken) {

    getCommission(payload, callback);
}

function getCommission(payload, callback) {
    typeData.findTypeData(payload)
        .then((templateData) => {

            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.get = get;

