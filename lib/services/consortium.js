'use strict';

const validator = require('../validator');
const consortiumRepo = require('../repositories/consortium');
const permissionsHelper = require('../helpers/permissions');
const permissionConst = require('../constants/permissions');
const common = require('../../lib/helpers/common');
const _ = require('lodash');
const consortium = require('./consortium');
const commonConst = require('../constants/common');


function create(payload) {
    return validator.errorValidate(payload, validator.schemas.consortium.create)
        .then(() => {
            payload.data.createdBy = payload.createdBy;
            return consortiumRepo.create(payload.data);
        })
}

function getDetails(payload) {
    return validator.validate(payload, validator.schemas.consortium.consortiumDetail)
        .then(() => consortiumRepo.findOneById(payload.consortiumID))
        .then((res) => {
            const response = {};
            response.data = res;
            return response;
        });
}



function getList(payload) {
    let count = 0;
    return validator.validate(payload, validator.schemas.consortium.getConsortium)
        .then(() => consortiumRepo.find(payload))
        .then((res) => {
            const response = {};
            response.count = _.get(res, '[1]', "");
            response.consortium = _.get(res, '[0]', []);
            return response;
        });
}


function update(payload) {
    return validator.errorValidate(payload, validator.schemas.consortium.update)
        .then(() => {
            payload.data.updatedBy = payload.userId;
            payload.data.updatedAt = payload.updatedAt;
            return consortiumRepo.findOneAndUpdate({ _id: payload.data._id }, payload.data);
        });
}

module.exports = {
    getList,
    getDetails,
    create,
    update
};

