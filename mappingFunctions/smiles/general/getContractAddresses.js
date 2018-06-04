'use strict';
var config = require('../../../api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

const contractAddresses = [{
    name: 'Sharaf DG',
    value: '0xfAD8CcA0aB96c0048AeC12f259514BA54D8b1e36'
}]
exports.getContractAddresses = function (payload, UUIDKey, route, callback, JWToken) {

    logger.info("The notification going is as follows" + JSON.stringify(payload))

    callback({
        "contracts": {
            "data": contractAddresses
        }
    });
}




