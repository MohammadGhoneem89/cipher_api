'use strict';

const validator = require('../validator');
const commissionRepo = require('../repositories/commissionTemplate');
const permissionsHelper = require('../helpers/permissions');
const permissionConst = require('../constants/permissions');
const common = require('../../lib/helpers/common');
const chainBreaker = common.chainBreaker;
const _ = require('lodash');
const auditLog = require('./auditLog');
const commonConst = require('../constants/common');

function getList(payload) {
  let count = 0;
  return validator.validate(payload, validator.schemas.commissionTemplate.getCommission)
    .then(() => commissionRepo.find(payload))
    .then((res) => {
      count = res[1];
      const params = {
        userId: payload.userId,
        documents: res[0],
        docType: 'actions',
        page: permissionConst.commissionTemplateList.pageId,
        component: permissionConst.commissionTemplateList.component.searchGrid
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => {
      const response = {};
      response.count = count;
      response.commissionTemplate = _.get(res, 'documents', []);
      response.actions = _.get(res, 'pageActions', []);
      return response;
    });
}

function findTypeData() {
  return commissionRepo.findTypeData();
}

function getDetails(payload) {
  return validator.validate(payload, validator.schemas.commissionTemplate.templateDetail)
    .then(() => commissionRepo.findOneById(payload.templateID))
    .then((res) => {
      res = res || {};
      const params = {
        userId: payload.userId,
        documents: res,
        docType: 'actions',
        page: permissionConst.commissionTemplateDetail.pageId,
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
  return validator.errorValidate(payload, validator.schemas.commissionTemplate.update)
    .then(() => {
      for (let i = 0; i < payload.data.commissionDetails; i += i) {
        if (+payload.data.commissionDetails[i].percentageRate > 100) {
          const error = { percentageRate: 'percentage should be less than 100' };
          throw error;
        }
      }
      payload.data.updatedBy = payload.userId;
      payload.data.updatedAt = payload.updatedAt;
      payload.data.ipAddress = payload.ipAddress;
      return commissionRepo.findOneAndUpdate({ _id: payload.data._id }, payload.data);
    });
}

function create(payload) {
  return validator.errorValidate(payload, validator.schemas.commissionTemplate.create)
    .then(() => {
      for (let i = 0; i < payload.data.commissionDetails; i += i) {
        if (+payload.data.commissionDetails[i].percentageRate > 100) {
          const error = { percentageRate: 'percentage should be less than 100' };
          throw error;
        }
      }
      payload.data.createdBy = payload.createdBy;
      payload.data.updatedBy = payload.createdBy;
      return commissionRepo.findOneAndcreate(payload.data);
    })
    .then(() => {
      const params = {
        event: commonConst.auditLog.eventKeys.insert,
        collectionName: 'CommissionTemplate',
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

