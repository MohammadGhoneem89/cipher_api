'use strict';

const validator = require('../../lib/validator');
const onBoardingRepo = require('../../lib/repositories/onBoarding');
const permissionsHelper = require('../../lib/helpers/permissions');
const permissionConst = require('../../lib/constants/permissions');
const _ = require('lodash');

function getList(payload) {
    return validator.validate(payload, validator.schemas.onBoarding.get)
        .then(() => onBoardingRepo.find(payload))
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
    return onBoardingRepo.findTypeData();
}

function getDetails(payload) {
    return validator.validate(payload, validator.schemas.onBoarding.Detail)
        .then(() => {
            return onBoardingRepo.findOneById(payload.data.id);
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
    return validator.errorValidate(payload, validator.schemas.onBoarding.update)
        .then(() => {
            payload.data.updatedBy = payload.userId;
            payload.data.updatedAt = payload.updatedAt;
            return onBoardingRepo.findOneAndUpdate({ _id: payload.data._id }, payload.data);
        });
}

function create(payload) {
    return validator.errorValidate(payload, validator.schemas.onBoarding.create)
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

