'use strict';

const permissionRepo = require('../repositories/permission');
const permissionHelper = require('../helpers/permissions');
const permissionConst = require('../constants/permissions');
const groupRepo = require('../repositories/group');
const validator = require('../validator');
const commonConst = require('../constants/common');
const auditLog = require('./auditLog');

module.exports = {
  insert,
  update,
  details,
  list,
  listPermissions
};

function insert(payload) {
  return validator.errorValidate(payload, validator.schemas.group.insert)
    .then(() => permissionRepo.filterPermissions(payload.data.checked))
    .then((permissions) => {
      payload.data.permissions = permissions;
      payload.data.createdBy = payload.createdBy;
      payload.data.updatedBy = payload.createdBy;
      return groupRepo.create(payload.data);
    })
    .then(() => {
      const params = {
        event: commonConst.auditLog.eventKeys.insert,
        collectionName: 'Group',
        ipAddress: payload.ipAddress,
        current: payload.data,
        createdBy: payload.createdBy
      };
      return auditLog.create(params);
    });
}

function update(payload) {
  return validator.errorValidate(payload, validator.schemas.group.update)
    .then(() => permissionRepo.filterPermissions(payload.data.checked))
    .then((permissions) => {
      payload.data.permissions = permissions;
      payload.data.updatedBy = payload.updatedBy;
      payload.data.updatedAt = payload.updatedAt;
      payload.data.ipAddress = payload.ipAddress;
      return groupRepo.findOneAndUpdate({ _id: payload.data.id }, payload.data);
    });
}

function details(payload) {
  let nodes = [];
  return permissionRepo.find()
    .then((permissions) => {
      nodes = permissions;
      return groupRepo.findOneById(payload.id);
    })
    .then((group) => {
      group = group || {};
      group.nodes = nodes;
      delete group.permissions;
      const params = {
        userId: payload.userId,
        documents: group,
        docType: 'actions',
        page: permissionConst.groupDetail.pageId,
        component: permissionConst.groupDetail.component.searchGrid
      };
      return permissionHelper.embed(params);
    })
    .then((res) => {
      return {
        searchResult: res.documents[0],
        actions: res.pageActions
      };
    });
}

function listPermissions(payload) {
  let count = 0;
  return permissionRepo.find(payload)
    .then((res) => {
      return res;
    })

}

function list(payload) {
  let count = 0;
  return validator.errorValidate(payload, validator.schemas.group.list)
    .then(() => groupRepo.findPageAndCount(payload))
    .then((res) => {
      count = res[1];
      const params = {
        userId: payload.userId,
        documents: res[0],
        docType: 'actions',
        page: permissionConst.groupList.pageId,
        component: permissionConst.groupList.component.searchGrid
      };
      return permissionHelper.embed(params);
    })
    .then((res) => {
      const response = {
        searchResult: res.documents,
        actions: res.pageActions,
        count: count
      };
      return response;
    });
}
