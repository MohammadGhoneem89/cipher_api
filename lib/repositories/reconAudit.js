'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');

const ReconAudit = models.ReconAudit;
const ReconAuditTransaction = models.ReconAuditTransaction;

module.exports = {
  create,
  findById,
  findByBatchId,
  findReconTrailTransactions,
  updateStatus,
  update,
  findPageAndCount,
  findPageAndCount2,
  findReconAudit,
  markStatus
};

function create(payload) {
  return new ReconAudit(payload).save();
}

function findById(id) {
  return Promise.all([
    ReconAudit.findOne({ _id: id }).lean(true),
    ReconAuditTransaction.find({ reconAuditId: id })
  ])
    .then((res) => {
      if (!res[0]) {
        const err = { message: 'no record found' };
        throw err;
      }
      res[1] = res[1] || [];
      res[0].transactions = _.map(res[1], 'transaction');
      return res[0];
    });
}

function findByBatchId({ id, FPSBatchID }) {
  return Promise.all([
    ReconAudit.findOne({ _id: id }).lean(true),
    ReconAuditTransaction.find({ reconAuditId: id, 'transaction.FPS_batchID': FPSBatchID })
  ])
    .then((res) => {
      if (!res[0]) {
        const err = { message: 'no record found' };
        throw err;
      }
      res[1] = res[1] || [];
      res[0].transactions = _.map(res[1], 'transaction');
      return res[0];
    });
}

function updateStatus(payload) {
  const promises = [];
  for (const pTrans of payload.transactions) {
    const and = [];
    const or = [];
    let set = { updatedAt: payload.updatedAt, updatedBy: payload.updatedBy };
    if (pTrans.ePayNo) {
      or.push({ 'transaction.ePayNo': pTrans.ePayNo });
    }
    if (pTrans.FPSBatchID) {
      or.push({ 'transaction.FPS_batchID': pTrans.FPSBatchID });
    }
    and.push({ $or: or });
    and.push({ 'transaction.FPS_status': 'SUCCESS' });
    and.push({ reconAuditId: payload.id });
    if (pTrans.BLAStatus) {
      set = Object.assign(set, { 'transaction.BLA_status': pTrans.BLAStatus });
    }
    if (pTrans.BLAMessageID) {
      set = Object.assign(set, { 'transaction.BLA_messageID': pTrans.BLAMessageID });
    }
    if (pTrans.FPSBatchID) {
      set = Object.assign(set, { 'transaction.FPS_batchID': pTrans.FPSBatchID });
    }
    promises.push(ReconAuditTransaction.update({ $and: and }, { $set: set }, { multi: true }));
  }
  promises.push(ReconAudit.update({ _id: payload.id }, { $set: { status: 'IN PROGRESS', updatedAt: payload.updatedAt, updatedBy: payload.updatedBy } }));
  return Promise.all(promises)
    .then(() => {
      return { success: true };
    });

}

function findPageAndCount(payload) {
  const query = {};
  let gte = {};
  let lte = {};

  if (payload.searchCriteria.reqType) {
    query.reqType = payload.searchCriteria.reqType;
    if (payload.searchCriteria.shortCode && payload.searchCriteria.reqType === commonConst.reconAudit.reqTypeKeys.e) {
      query.SPCode = payload.searchCriteria.shortCode;
    }
    if (payload.searchCriteria.shortCode && payload.searchCriteria.reqType === commonConst.reconAudit.reqTypeKeys.a) {
      query.PGCode = payload.searchCriteria.shortCode;
    }
  }
  if (payload.searchCriteria.reconType) {
    query.reconType = payload.searchCriteria.reconType;
  }
  if (payload.searchCriteria.fromDate) {
    gte = { $gte: dates.ddMMyyyyMS(payload.searchCriteria.fromDate) };
  }
  if (payload.searchCriteria.toDate) {
    lte = { $lte: dates.ddMMyyyyMS(payload.searchCriteria.toDate) };
  }
  query.createdAt = Object.assign(gte, lte);
  if (_.isEmpty(query.createdAt)) {
    delete query.createdAt;
  }
  return Promise.all([
    ReconAudit
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .select('validationSummary org createdBy fileName filePath reqType shortCode serviceCode IP reconType updatedAt createdAt createdID status')
      .populate({ path: 'createdBy', select: 'userID' })
      .sort({ createdAt: -1 })
      .lean(true)
      .exec(),
    ReconAudit.count(query)
  ]);
}

function findPageAndCount2(payload) {
  const query = {};
  let gte = {};
  let lte = {};

  if (payload.searchCriteria.reqType) {
    query.reqType = payload.searchCriteria.reqType;
    if (payload.searchCriteria.shortCode && payload.searchCriteria.reqType === commonConst.reconAudit.reqTypeKeys.e) {
      query.SPCode = payload.searchCriteria.shortCode;
    }
    if (payload.searchCriteria.shortCode && payload.searchCriteria.reqType === commonConst.reconAudit.reqTypeKeys.a) {
      query.PGCode = payload.searchCriteria.shortCode;
    }
  }
  if (payload.searchCriteria.reconType) {
    query.reconType = payload.searchCriteria.reconType;
  }
  if (payload.searchCriteria.fromDate) {
    gte = { $gte: dates.ddMMyyyyMS(payload.searchCriteria.fromDate) };
  }
  if (payload.searchCriteria.toDate) {
    lte = { $lte: dates.ddMMyyyyMS(payload.searchCriteria.toDate) };
  }
  query.createdAt = Object.assign(gte, lte);
  if (_.isEmpty(query.createdAt)) {
    delete query.createdAt;
  }
  return Promise.all([
    ReconAudit
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .select('validationSummary org createdBy fileName filePath reqType shortCode serviceCode IP reconType updatedAt createdAt status')
      .populate({ path: 'createdBy', select: 'userID' })
      .lean(true)
      .exec(),
    ReconAudit.count(query)
  ]);
}

function findReconAudit(payload, projection) {
  let gte = {};
  let lte = {};
  const criteria = [];
  payload.searchCriteria = payload.searchCriteria || {};
  if (payload.searchCriteria.reqType) {
    // query.reqType = payload.searchCriteria.reqType;
    if (payload.searchCriteria.shortCode && payload.searchCriteria.reqType === commonConst.reconAudit.reqTypeKeys.e) {
      criteria.push({ 'reqType': { '$regex': payload.searchCriteria.reqType, '$options': 'si' } });
    }
    if (payload.searchCriteria.shortCode && payload.searchCriteria.reqType === commonConst.reconAudit.reqTypeKeys.a) {
      criteria.push({ 'reqType': { '$regex': payload.searchCriteria.reqType, '$options': 'si' } });
    }
  }
  if (payload.searchCriteria.reconType) {
    criteria.push({ 'reconType': { '$regex': payload.searchCriteria.reconType, '$options': 'si' } });
  }
  if (payload.searchCriteria.fromDate) {
    gte = { $gte: dates.ddMMyyyyMS(payload.searchCriteria.fromDate) };
  }
  if (payload.searchCriteria.toDate) {
    lte = { $lte: dates.ddMMyyyyMS(payload.searchCriteria.toDate) };
  }
  if (!_.isEmpty(Object.assign(gte, lte))) {
    criteria.push({ createdAt: Object.assign(gte, lte) });
  }
  const query = criteria.length > 0 ? { '$and': criteria } : {};
  return ReconAudit
    .find(query, projection)
    .lean(true)
    .exec();
}

function findReconTrailTransactions(payload) {
  const success = 'SUCCESS';
  const processOk = 'PROCESSED OK';
  const failed = 'FAILED';
  const inProgress = 'IN PROGRESS';

  let gte = {};
  let lte = {};
  const statusQuery = {
    failed: {
      $or: [
        { 'transaction.BLA_status': { $nin: [processOk, success] } },
        { 'transaction.BLA_status': failed }
      ]
    },
    success: { 'transaction.BLA_status': success, 'transaction.FPS_status': success },
    inProgress: { 'transaction.BLA_status': processOk, 'transaction.FPS_status': success },
    all: {}
  };
  let query = { reconAuditId: payload.id };
  if (payload.searchCriteria.pgRefNo) {
    query = _.merge({}, query, { 'transaction.PGRefNo': payload.searchCriteria.pgRefNo });
  }
  if (payload.searchCriteria.sPRefNo) {
    query = _.merge({}, query, { 'transaction.SPTRN': payload.searchCriteria.sPRefNo });
  }
  if (payload.searchCriteria.degRefNo) {
    query = _.merge({}, query, { 'transaction.ePayNo': payload.searchCriteria.degRefNo });
  }
  if (payload.searchCriteria.processor) {
    query = _.merge({}, query, { 'transaction.SPCode': payload.searchCriteria.processor });
  }
  if (payload.searchCriteria.entity) {
    query = _.merge({}, query, { 'transaction.PGNo': payload.searchCriteria.entity });
  }
  if (payload.searchCriteria.fromDate) {
    gte = { $gte: dates.ddMMyyyyMS(payload.searchCriteria.fromDate) };
  }
  if (payload.searchCriteria.toDate) {
    lte = { $lte: dates.addDays(dates.ddMMyyyyMS(payload.searchCriteria.toDate), 1) };
  }
  query['transaction.transDate'] = Object.assign(gte, lte);
  if (_.isEmpty(query['transaction.transDate'])) {
    delete query['transaction.transDate'];
  }

  const blaQuery = statusQuery[payload.searchCriteria.tranStatus] || {};
  const mongoQuery = { $and: [query, blaQuery] };

  return Promise.all([
    ReconAudit.findOne({ _id: payload.id }).lean(true),
    ReconAuditTransaction.find(mongoQuery).limit(payload.page.pageSize).skip(payload.page.pageSize * (payload.page.currentPageNo - 1)).lean(true),
    ReconAuditTransaction.count(mongoQuery),
    ReconAuditTransaction.count(Object.assign({ reconAuditId: payload.id }, statusQuery.failed)),
    ReconAuditTransaction.count(Object.assign({ reconAuditId: payload.id }, statusQuery.success)),
    ReconAuditTransaction.count(Object.assign({ reconAuditId: payload.id }, statusQuery.inProgress))
  ])
    .then((res) => {
      for (const tran of res[1]) {
        if (tran.transaction.FPS_status !== success) {
          tran.transaction.status = failed;
          tran.transaction.desc = tran.transaction.FPS_errors || '';
        }
        else if (tran.transaction.FPS_status === success && tran.transaction.BLA_status === success) {
          tran.transaction.status = success;
          tran.transaction.desc = tran.transaction.BLADescription || '';
        }
        else if (tran.transaction.FPS_status === success && tran.transaction.BLA_status === processOk) {
          tran.transaction.status = inProgress;
          tran.transaction.desc = tran.transaction.BLADescription || '';
        }
        else if ((tran.transaction.FPS_status === success) && (tran.transaction.BLA_status !== processOk || tran.transaction.BLA_status !== success || tran.transaction.BLA_status === failed)) {
          tran.transaction.status = failed;
          tran.transaction.desc = tran.transaction.BLADescription || '';
        }
      }
      return res;
    });
}

function markStatus(payload) {
  const set = {
    updatedAt: payload.updatedAt,
    status: payload.status,
    message: payload.message
  };
  return Promise.all([
    ReconAudit.update({ _id: payload.id }, { $set: set })
  ]);

}

function update(query, set) {
  return ReconAudit.update(query, { $set: set });
}
