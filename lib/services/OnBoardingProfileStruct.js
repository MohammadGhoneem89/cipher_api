'use strict';

const validator = require('../../lib/validator');
const onBoardingProStructRepo = require('../../lib/repositories/OnBoardingProfileStruct');
const permissionsHelper = require('../../lib/helpers/permissions');
const permissionConst = require('../../lib/constants/permissions');
const _ = require('lodash');

function getList(payload) {
    return validator.validate(payload, validator.schemas.onBoardingProfileStruct.get)
        .then(() => onBoardingProStructRepo.find(payload))
        .then((res) => {
            const response = {};
            response.count = _.get(res, '[1]', []);
            response.paymentList = _.get(res, '[0]', []);
            response.actions = _.get(res, 'pageActions', []);
            return response;
        })
        .catch((err) => {
            console.log("Error : ", JSON.stringify(err));
        })
}

function findTypeData() {
    return onBoardingProStructRepo.findTypeData();
}

function getDetails(payload) {
    return validator.validate(payload, validator.schemas.onBoardingProfileStruct.Detail)
        .then(() => {
            return onBoardingProStructRepo.findOneById(payload.data.id);
        }).then((res) => {
            const params = {
                userId: payload.userID,
                documents: res,
                docType: 'actions',
                page: permissionConst.workingCalendarDetail.pageId,
                component: ''
            };
            return permissionsHelper.embed(params);
        })
        .then((res) => _.get(res, 'documents[0]', {}));
}

function update(payload) {
    return validator.errorValidate(payload, validator.schemas.onBoardingProfileStruct.update)
        .then(() => {
            payload.data.updatedBy = payload.userId;
            payload.data.updatedAt = payload.updatedAt;
            return onBoardingProStructRepo.findOneAndUpdate({ _id: payload.data._id }, payload.data);
        });
}

function create(payload) {
    return validator.errorValidate(payload, validator.schemas.onBoardingProfileStruct.create)
        .then(() => {
            payload.data.createdBy = payload.userId;
            payload.data.updatedBy = payload.userId;
            return onBoardingRepo.create(payload.data);
        });
}

module.exports = {
    getList,
    getDetails,
    create,
    update,
    findTypeData
};

