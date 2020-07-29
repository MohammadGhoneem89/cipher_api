'use strict';

const _ = require('lodash');
const validator = require('../validator');
const typeDataRepo = require('../repositories/typeData');
const permissionsHelper = require('../helpers/permissions');
const permissionConst = require('../constants/permissions');

module.exports = {
  find,
  getDetails,
  getTypeDataDetailById,
  insertTypeData,
  updateTypeData,
  getTypeDataDetailByType
};

function find(payload) {
  return typeDataRepo.findTypeData(payload);
}

function getTypeData(typeDataName) {
  return typeDataRepo.findFields(typeDataName);
}

function getDetails(payload) {
  const response = {};
  return validator.errorValidate(payload, validator.schemas.typeData.typeName)
    .then(() => Promise.all([
      typeDataRepo.getDetails(payload.searchCriteria.typeName, payload.page.pageSize, payload.page.currentPageNo),
      typeDataRepo.getCount(payload.searchCriteria.typeName),
      typeDataRepo.getTypeDataList(payload.searchCriteria.typeName)
    ]))
    .then((res) => {
      response.count = res[1];
      response.typeDataList = res[2];
      const params = {
        userId: payload.userId,
        documents: res[0],
        docType: 'actions',
        page: permissionConst.typeDataList.pageId,
        component: permissionConst.typeDataList.component.searchGrid
      };
      return permissionsHelper.embed(params);
    }).then((res) => {
      response.data = _.get(res, 'documents', []);
      response.actions = _.get(res, 'pageActions', []);
      return response;
    });
}

async function getTypeDataDetailByType(payload) {
  try {
    return await typeDataRepo.getTypeDataDetailByType(payload.searchCriteria.type);
  } catch (e) {
    throw new Error(e);
  }
}

function getTypeDataDetailById(payload) {
  return validator.validate(payload, validator.schemas.typeData.ObjectData)
    .then(() => typeDataRepo.getTypeDataDetailById(payload.typeDataId));

}

function insertTypeData(payload) {
  return validator.errorValidate(payload, validator.schemas.typeData.insertData)
    .then(() => typeDataRepo.insertTypeData(payload.typeName, payload.typeNameDetails, payload.type, payload.isForign));

}

function updateTypeData(payload) {
  return validator.errorValidate(payload, validator.schemas.typeData.updateData)
    .then(() => typeDataRepo.updateTypeData(payload.id, payload.type, payload.typeName, payload.typeNameDetails, payload.isForign));

}
