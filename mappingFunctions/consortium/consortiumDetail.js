'use strict';

const consortium = require('../../lib/services/consortium');
var pointer = require("json-pointer");
const logger = require('../../lib/helpers/logger')().app;

function consortiumDetail(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    get(payload, callback);
}

function get(payload, callback) {
    logger.debug(' [ Consortium Details ] Payload : ' + JSON.stringify(payload));
    consortium.getDetails(payload)
        .then((consortiumData) => {
            const response = {
                consortiumDetail: {
                    action: payload.action,
                    data: consortiumData
                }
            };
            callback(response);
        })
        .catch((err) => {
            logger.error(' [ Consortium Details ] Error : ' + err);
            callback(err);
        });
}

exports.consortiumDetail = consortiumDetail;

