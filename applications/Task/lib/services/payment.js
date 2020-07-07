'use strict';

const validator = require('../../../../lib/validator');
const paymentRepo = require('../../lib/repositories/payment');
const permissionsHelper = require('../../../../lib/helpers/permissions');
const permissionConst = require('../../../../lib/constants/permissions');
const _ = require('lodash');

function getList(payload) {
    let count = 0;
    return validator.validate(payload, validator.schemas.payment.get)
        .then(() => paymentRepo.find(payload))
        .then((res) => {
            count = res[1];
            const params = {
                userId: payload.userId,
                documents: res[0],
                docType: 'actions',
                page: permissionConst.workingCalendarList.pageId,
                component: permissionConst.workingCalendarList.component.searchGrid
            };
            return permissionsHelper.embed(params);
        })
        .then((res) => {
            const response = {};
            response.count = count;
            response.paymentList = _.get(res, 'documents', []);
            response.actions = _.get(res, 'pageActions', []);
            return response;
        })
        .catch((err) => {
        console.log("Error : ", JSON.stringify(err));
        })
}

function findTypeData() {
    return paymentRepo.findTypeData();
}

function getDetails(payload) {
    return validator.validate(payload, validator.schemas.payment.Detail)
        .then(() => {
            return paymentRepo.findOneById(payload.data.id);
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
    return validator.errorValidate(payload, validator.schemas.payment.update)
        .then(() => {
            payload.data.updatedBy = payload.userId;
            payload.data.updatedAt = payload.updatedAt;
            return paymentRepo.findOneAndUpdate({ _id: payload.data._id }, payload.data);
        });
}

function create(payload) {
    return validator.errorValidate(payload, validator.schemas.payment.create)
        .then(() => {
            payload.data.createdBy = payload.userId;
            payload.data.updatedBy = payload.userId;
            return paymentRepo.create(payload.data);
        });
}

module.exports = {
    getList,
    getDetails,
    create,
    update,
    findTypeData
};

