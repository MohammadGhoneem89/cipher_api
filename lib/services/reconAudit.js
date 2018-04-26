'use strict';

const _ = require('lodash');
const dates = require('../helpers/dates');
const fileHelper = require('../helpers/file');
const validator = require('../validator');
const permissionsHelper = require('../helpers/permissions');
const reconAuditRepo = require('../repositories/reconAudit');
const permissionsConst = require('../constants/permissions');
const reconAuditTransactionRepo = require('../repositories/reconAuditTransaction');

module.exports = {
  create,
  getDetails,
  trail,
  updateStatus,
  list,
  list2,
  createTranx,
  reconAuditDetail,
  reconAuditTrail,
  markStatus
};

function create(payload) {
  let reconAudi;
  return validator.validate(payload, validator.schemas.reconAudit.create)
    .then(() => {
      if (!payload._id) {
        return reconAuditRepo.create(payload);
      }
      payload.transactions = payload.transactions || [];
      if (payload._id && !payload.transactions.length) {
        return updateValidationSummary(payload);
      }
      return Promise.resolve({ _id: payload._id });
    })
    .then((recon) => {
      reconAudi = recon;
      const promises = [];
      for (const tran of payload.transactions) {
        const obj = {
          reconAuditId: recon._id,
          createdBy: payload.createdBy,
          updatedBy: payload.updatedBy,
          transaction: tran
        };
        promises.push(reconAuditTransactionRepo.create(obj));
      }
      return Promise.all(promises);
    })
    .then(() => {
      return { _id: reconAudi._id };
    });

  function updateValidationSummary(payload) {
    return reconAuditRepo.update({ _id: payload }, { validationSummary: payload.validationSummary })
      .then(() => {
        return { _id: payload._id };
      });
  }
}

function createTranx(payload) {
  return validator.validate(payload, validator.schemas.reconAudit.createTranx)
    .then(() => {
      return fileHelper.readFromFile(payload.filePath);
    })
    .then((reconAudit) => {
      reconAudit = JSON.parse(reconAudit);
      fileHelper.deleteFile(payload.filePath);
      return create(reconAudit);
    });

}

function getDetails(payload) {
  return validator.errorValidate(payload, validator.schemas.reconAudit.id)
    .then(() => {
      if (payload.FPSBatchID) {
        return reconAuditRepo.findByBatchId({ id: payload.id, FPSBatchID: payload.FPSBatchID});
      }
      else {
        return reconAuditRepo.findById(payload.id);
      }
    })
    .then((reconAudit) => {
      const transactions = reconAudit.transactions || [];
      const newTransactions = [];
      for (const trans of transactions) {
        if (trans.BLA_status === 'PROCESSED OK') {
          newTransactions.push(trans);
        }
      }
      reconAudit.transactions = newTransactions;
      return reconAudit;
    });
}

function updateStatus(payload) {
  return validator.errorValidate(payload, validator.schemas.reconAudit.updateStatus)
    .then(() => reconAuditRepo.updateStatus(payload));
}

function list(payload) {
  let count = 0;
  return validator.errorValidate(payload, validator.schemas.reconAudit.list)
    .then(() => reconAuditRepo.findPageAndCount(payload))
    .then((res) => {
      count = res[1];
      const params = {
        userId: payload.userId,
        documents: res[0],
        docType: 'actions',
        page: permissionsConst.reconAuditList.pageId,
        component: permissionsConst.reconAuditList.component.searchGrid
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => {
      for (const doc of res.documents) {
        doc.createdAt = doc.createdAt ? dates.MSddMMyyyy(doc.createdAt) : '';
        doc.updatedAt = doc.updatedAt ? dates.MSddMMyyyy(doc.updatedAt) : '';
        doc.createdBy = _.get(doc, 'createdBy.userID');
      }
      res.documents.map((item) => {
        if (item.status === 'FAILED') {
          item.status = { type: 'ERROR', value: item.status };
        }
        else if (item.status === 'COMPLETED') {
          item.status = { type: 'SUCCESS', value: item.status };
        }
        else {
          item.status = { type: '', value: item.status };
        }

      });
      return [res.documents, count];
    });
}

function list2(payload) {
  let count = 0;
  return validator.errorValidate(payload, validator.schemas.reconAudit.list)
    .then(() => reconAuditRepo.findPageAndCount2(payload))
    .then((res) => {
      count = res[1];
      const params = {
        userId: payload.userId,
        documents: res[0],
        docType: 'actions',
        page: permissionsConst.reconAuditList.pageId,
        component: permissionsConst.reconAuditList.component.searchGrid
      };
      return permissionsHelper.embed(params);
    })
    .then((res) => {
      for (const doc of res.documents) {
        doc.createdAt = doc.createdAt ? dates.MSddMMyyyy(doc.createdAt) : '';
        doc.updatedAt = doc.updatedAt ? dates.MSddMMyyyy(doc.updatedAt) : '';
        doc.createdBy = _.get(doc, 'createdBy.userID');
      }
      return [res.documents, count];
    });
}

function trail(payload) {
  return validator.errorValidate(payload, validator.schemas.reconAudit.trail)
    .then(() => {
      return reconAuditRepo.findReconTrailTransactions(payload);
    })
    .then((res) => {
      const reconAudit = res[0];
      reconAudit.transactions = _.map(res[1], 'transaction');
      const tileSummary = {
        success: res[4],
        failed: res[3],
        inProgress: res[5]
      };
      reconAudit.tileSummary = tileSummary;
      return {
        trail: reconAudit,
        count: res[2],
        updatedAt: res[0].updatedAt
      };
    });
}

function reconAuditDetail(payload) {
  return validator.errorValidate(payload, validator.schemas.reconAudit.reconAuditDetail)
    .then(() => reconAuditRepo.findById(payload.id))
    .then((reconAudit) => {
      let query = {};
      payload.searchCriteria = payload.searchCriteria || {};

      if (payload.searchCriteria.pgRefNo) {
        query = _.merge({}, query, { 'PGRefNo': payload.searchCriteria.pgRefNo });
      }
      if (payload.searchCriteria.sPRefNo) {
        query = _.merge({}, query, { 'SPTRN': payload.searchCriteria.sPRefNo });
      }
      if (payload.searchCriteria.degRefNo) {
        query = _.merge({}, query, { 'ePayNo': payload.searchCriteria.degRefNo });
      }
      if (payload.searchCriteria.tranStatus) {
        query = _.merge({}, query, { 'BLA_status': payload.searchCriteria.tranStatus });
      }
      if (payload.searchCriteria.processor) {
        query = _.merge({}, query, { 'SPCode': payload.searchCriteria.processor });
      }
      if (payload.searchCriteria.entity) {
        query = _.merge({}, query, { 'PGNo': payload.searchCriteria.entity });
      }
      const transactions = _.filter(reconAudit.transactions, query);

      payload.searchCriteria.fromDate = dates.ddMMyyyyMS(payload.searchCriteria.fromDate);
      payload.searchCriteria.toDate = dates.addDays(dates.ddMMyyyyMS(payload.searchCriteria.toDate), 1);

      _.remove(transactions, (transaction) => {
        return (payload.searchCriteria.fromDate && transaction.transDate < payload.searchCriteria.fromDate);
      });
      _.remove(transactions, (transaction) => {
        return (payload.searchCriteria.toDate && transaction.transDate > payload.searchCriteria.toDate);
      });

      reconAudit.transactions = reconAudit.transactions || [];

      return reconAudit.transactions;
    });
}

function reconAuditTrail(payload, projection) {
  return validator.errorValidate(payload, validator.schemas.reconAudit.reconAuditTrail)
    .then(() => reconAuditRepo.findReconAudit(payload, projection));
}

function markStatus(payload) {
  return validator.errorValidate(payload, validator.schemas.reconAudit.markStatus)
    .then(() => reconAuditRepo.markStatus(payload));
}
