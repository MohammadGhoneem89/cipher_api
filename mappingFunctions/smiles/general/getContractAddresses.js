'use strict';
var config = require('../../../api/bootstrap/smiles.json')
const rp = require('request-promise');
const logger = require('../../../lib/helpers/logger')().app;

const contractAddresses = [{
    name: 'Merchant',
    value: '0x25fD7831ccc5F4d7124e0579e89495420d82b5E0'
}]
exports.getContractAddresses = function (payload, UUIDKey, route, callback, JWToken) {

    logger.info("The notification going is as follows" + JSON.stringify(payload))

    callback({
        "contracts": {
            "data": contractAddresses
        }
    });
}




