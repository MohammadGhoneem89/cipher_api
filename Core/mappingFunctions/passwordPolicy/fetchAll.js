/**
 * Created by abdullah on 4/17/18.
 */
'use strict';

const passwordPolicy = require('../../lib/services/passwordPolicy');


function fetchAllPasswordPolicy(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    get(payload, callback);
}

function get(payload, callback) {

    passwordPolicy.fetchAll(payload)
        .then((res) => {
            const response = {
                fetchPasswordPolicy: {
                    action: payload.action,
                    data:{
                        passwordPolicy:res.data,
                        actions:res.actions
                    }

                }
            };
            callback(response);
        })
        .catch((err) => {
            callback(err);
        });
}

exports.fetchAllPasswordPolicy = fetchAllPasswordPolicy;

