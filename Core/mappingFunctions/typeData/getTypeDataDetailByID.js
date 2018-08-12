/**
 * Created by abdullah on 4/17/18.
 */
'use strict';

const typeData = require('../../lib/services/typeData');


function getTypeDataDetailById(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    get(payload, callback);
}

function get(payload, callback) {

    typeData.getTypeDataDetailById(payload)
        .then((typeData) => {
            const response = {
                getTypeDataDetailByID: {
                    action: payload.action,
                    data: typeData
                }
            };
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.getTypeDataDetailById = getTypeDataDetailById;

