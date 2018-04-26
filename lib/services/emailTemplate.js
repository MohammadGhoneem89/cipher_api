'use strict';

const validator = require('../validator');
const emailRepo = require('../repositories/emailTemplate');
const permissionsHelper = require('../helpers/permissions');
const permissionConst = require('../constants/permissions');
const common = require('../../lib/helpers/common');
const chainBreaker = common.chainBreaker;
const _ = require('lodash');
const auditLog = require('./auditLog');
const commonConst = require('../constants/common');

function getList(payload) {
  let count = 0;
  return validator.validate(payload, validator.schemas.emailTemplate.get)
    .then(() => emailRepo.find(payload))
    .then((res) => {
      count = res[1];
      const params = {
        userId: payload.userId,
        documents: res[0],
        docType: 'actions',
        page: permissionConst.emailTemplateList.pageId,
        component: permissionConst.emailTemplateList.component.searchGrid
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => {
      const response = {};
      response.count = count;
      response.emailTemplate = _.get(res, 'documents', []);
      response.actions = _.get(res, 'pageActions', []);
      return response;
    });

}

function findTypeData() {
  return emailRepo.findTypeData();
}

function getDetails(payload) {
  return validator.validate(payload, validator.schemas.emailTemplate.templateDetail)
    .then(() => emailRepo.findOneById(payload.templateID))
    .then((res) => {
      res = res || {};
      const params = {
        userId: payload.userId,
        documents: res,
        docType: 'actions',
        page: permissionConst.emailTemplateDetail.pageId,
        component: ''
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => {
      const response = {};
      response.data = res.documents[0];
      response.data.actions = res.pageActions;
      return chainBreaker.success(response);
    });
}

function update(payload) {
  return validator.errorValidate(payload, validator.schemas.emailTemplate.update)
    .then(() => {
      payload.data.updatedBy = payload.userId;
      payload.data.updatedAt = payload.updatedAt;
      payload.data.ipAddress = payload.ipAddress;
      return emailRepo.findOneAndUpdate({ _id: payload.data._id }, payload.data);
    });
}

function create(payload) {
  return validator.errorValidate(payload, validator.schemas.emailTemplate.create)
    .then(() => {
      payload.data.createdBy = payload.createdBy;
      payload.data.updatedBy = payload.createdBy;
      emailRepo.create(payload.data);
    })
    .then(() => {
      const params = {
        event: commonConst.auditLog.eventKeys.insert,
        collectionName: 'EmailTemplate',
        ipAddress: payload.ipAddress,
        current: payload.data,
        createdBy: payload.createdBy
      };
      return auditLog.create(params);
    });
}

module.exports = {
  getList,
  getDetails,
  create,
  update,
  findTypeData
};

