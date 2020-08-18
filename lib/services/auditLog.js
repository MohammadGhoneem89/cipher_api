'use strict';

const auditLogRepo = require('../repositories/auditLog');
const validator = require('../validator');
const dates = require('../helpers/dates');
const permissionsHelper = require('../helpers/permissions');
const permissionsConst = require('../constants/permissions');

module.exports = {
  create,
  getList,
  detail,
  findAuditLogs
};

function create(payload) {
  const params = {
    event: payload.event,
    collectionName: payload.collectionName,
    ipAddress: payload.ipAddress,
    current: payload.current,
    changes: payload.changes,
    previous: payload.previous,
    createdBy: payload.createdBy,
    createdAt: dates.newDate()
  };
  return auditLogRepo.create(params);
}

function getList(payload) {
  let count = 0;
  return validator.errorValidate(payload, validator.schemas.auditLog.getList)
    .then(() => auditLogRepo.findPageAndCount(payload))
    .then((res) => {
      count = res[1];
      const params = {
        userId: payload.userId,
        documents: res[0],
        docType: 'actions',
        page: permissionsConst.auditLogList.pageId,
        component: permissionsConst.auditLogList.component.searchGrid
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => {
      for (const doc of res.documents) {
        doc.createdAt = doc.createdAt ? dates.MSddMMyyyyHHmmSS(doc.createdAt) : '';
        delete doc.current;
        delete doc.previous;
      }
      return [res.documents, count];
    });
}

function detail(payload) {
  return validator.errorValidate(payload, validator.schemas.auditLog.detail)
    .then(() => auditLogRepo.findOneById(payload.id));
}

function findAuditLogs(payload, projection) {
  return validator.errorValidate(payload, validator.schemas.auditLog.findAuditLogs)
    .then(() => auditLogRepo.findAuditLogs(payload, projection));

}
