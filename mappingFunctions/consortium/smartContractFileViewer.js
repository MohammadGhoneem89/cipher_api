'use strict';

const consortium = require('../../lib/services/consortium');
var pointer = require("json-pointer");
const logger = require('../../lib/helpers/logger')().app;

function smartContractFileViewer(payload, UUIDKey, route, callback, JWToken) {
    payload.userId = JWToken._id;
    get(payload, callback);
}

function get(payload, callback) {
    logger.debug(' [ Consortium Details ] Payload : ' + JSON.stringify(payload));
    consortium.getFiles(payload).then(data => {
        callback({
            smartContractFiles: {
                action:'smartContractFiles',
                data: data}});
    })
        .catch((err) => {
            logger.error(' [ Consortium Details ] Error : ' + err);
            callback(err);
        });
}

exports.smartContractFileViewer = smartContractFileViewer;

