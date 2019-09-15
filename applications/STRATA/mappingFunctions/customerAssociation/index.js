'use strict';

const customerAssociationService = require('../../lib/services/customerAssociation');
const _ = require('lodash');

module.exports = {
    saveCustomerAssociation,
    getCustomerAssociationDetail,
    findOneAsync
};

function saveCustomerAssociation(payload, UUIDKey, route, callback, JWToken) {
    if (payload.data._id) {
        updateAsync(callback, payload);
    } else {
        createAsync(callback, payload);
    }
}

function getCustomerAssociationDetail(payload, UUIDKey, route, callback, JWToken) {
    findOneAsync(callback, payload).then((data) => { return callback(data) }).catch((e) => { return e })

}

async function createAsync(callback, payload) {
    const response = {};
    payload = payload || {};
    payload.action = payload.action || 'actionNotDefined';

    response[payload.action] = {
        action: payload.action,
        data: {
            message: {
                status: 'SUCCESS',
                errorDescription: 'Customer Association not inserted',
                displayToUser: true
            },
            error: ''
        }
    };

    try {
        response[payload.action].data.message.errorDescription = await customerAssociationService.create(payload);
    } catch (err) {
        response[payload.action].data.message.status = 'ERROR';
        response[payload.action].data.error = err.stack || err;
    }
    return callback(response);
}

async function updateAsync(callback, payload) {
    const response = {};
    payload = payload || {};
    payload.action = payload.action || 'actionNotDefined';

    response[payload.action] = {
        action: payload.action,
        data: {
            message: {
                status: 'SUCCESS',
                errorDescription: 'Customer Association not updated',
                displayToUser: true
            },
            error: ''
        }
    };

    try {
        response[payload.action].data.message.errorDescription = await customerAssociationService.update(payload);
    } catch (err) {
        response[payload.action].data.message.status = 'ERROR';
        response[payload.action].data.error = err.stack || err;
    }
    // return response;
    return callback(response);
}

async function findOneAsync(callback, payload) {
   
    const response = {};
    payload = payload || {};
    payload.action = payload.action || 'actionNotDefined';
    response[payload.action] = {
        action: payload.action,
        data: {}
    };
    try {
        response[payload.action].data = await customerAssociationService.findOne(payload);
    } catch (err) {
        response[payload.action].error = err.stack || err;
    }
     console.log("\n\n>>>>> ", response, " RESPONSE >>>>>>")
    return response;
}
