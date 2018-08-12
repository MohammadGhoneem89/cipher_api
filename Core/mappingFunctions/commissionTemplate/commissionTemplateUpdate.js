'use strict';

const commissionTemplate = require('../../lib/services/commissionTemplate');
const commissionPolicy = require('../getCommissionPolicy');
const dates = require('../../lib/helpers/dates');

function commissionTemplateUpdateOut(payload, UUIDKey, route, callback, JWToken){
    payload.userId = JWToken._id;
    payload.updatedAt = dates.newDate();
    commissionTemplateUpdate(payload,callback);
}

function commissionTemplateUpdate(payload, callback) {

    commissionTemplate.update(payload)
        .then((templateData) => {
            let message = {};
            if(!templateData){
                message = {
                    status: 'ERROR',
                    errorDescription: 'Commission Template not Updated',
                    displayToUser: true
                }
            }
            else{
                message = {
                    status: 'OK',
                    errorDescription: 'Commission Template Updated Successfully',
                    displayToUser: true,
                    newPageURL: '/commissionTemplateSearch'
                }
            }
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: message
                    }
                }
            };
            callback(response);
            setTimeout(function(){commissionPolicy.findPolicy(payload.data._id)},100)
        })
        .catch((err) => {
            const response = {
                responseMessage: {
                    action: payload.action,
                    data: {
                        message: {
                            status: 'ERROR',
                            errorDescription: err.template || 'Commission Template not Updated',
                            displayToUser: true
                        },
                        error: err
                    }
                }
            };
            callback(response);
        });
}

exports.commissionTemplateUpdateOut = commissionTemplateUpdateOut;

