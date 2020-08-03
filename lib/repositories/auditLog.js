'use strict';

const AuditLog = require('../models/AuditLog');
const dates = require('../helpers/dates');
const _ = require('lodash');

module.exports = {
  create,
  findPageAndCount,
  findOneById,
  findAuditLogs,
  find
};

function create(payload) {
  return global.db.insert('AuditLog', payload);
}

function findPageAndCount(payload) {
  const query = {};
  let gte = {};
  let lte = {};
  if (payload.searchCriteria.event) {
    query.event = payload.searchCriteria.event;
  }
  if (payload.searchCriteria.collectionName) {
    query.collectionName = payload.searchCriteria.collectionName;
  }
  if (payload.searchCriteria.ipAddress) {
    query.ipAddress = payload.searchCriteria.ipAddress;
  }
  if (payload.searchCriteria.fromDate) {
    gte = { $gte: dates.ddMMyyyyMS(payload.searchCriteria.fromDate) };
  }
  if (payload.searchCriteria.toDate) {
    lte = { $lte: dates.addDays(dates.ddMMyyyyMS(payload.searchCriteria.toDate), 1) };
  }
  query.createdAt = Object.assign(gte, lte);
  if (_.isEmpty(query.createdAt)) {
    delete query.createdAt;
  }
  return Promise.all([
    AuditLog
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .populate({ path: 'createdBy', select: 'userID' })
      .lean(true)
      .exec(),
    AuditLog.count(query)
  ]);
}

function findAuditLogs(payload, projection) {
  let query = {};
  let gte = {};
  let lte = {};
  const criteria = [];
  payload.searchCriteria = payload.searchCriteria || {};

  if (payload.searchCriteria.event) {
    criteria.push({ 'event': { '$regex': payload.searchCriteria.event, '$options': 'si' } });
  }
  if (payload.searchCriteria.collectionName) {
    criteria.push({ 'collectionName': { '$regex': payload.searchCriteria.collectionName, '$options': 'si' } });
  }
  if (payload.searchCriteria.ipAddress) {
    criteria.push({ 'ipAddress': { '$regex': payload.searchCriteria.ipAddress, '$options': 'si' } });
  }
  if (payload.searchCriteria.fromDate) {
    gte = { $gte: dates.ddMMyyyyMS(payload.searchCriteria.fromDate) };
  }
  if (payload.searchCriteria.toDate) {
    lte = { $lte: dates.addDays(dates.ddMMyyyyMS(payload.searchCriteria.toDate), 1) };
  }
  if (!_.isEmpty(Object.assign(gte, lte))) {
    criteria.push({ 'createdAt': Object.assign(gte, lte) });
    // query.createdAt = Object.assign(gte, lte);
  }
  query = criteria.length > 0 ? { '$and': criteria } : {};
  return AuditLog
    .find(query, projection)
    .lean(true)
    .exec();

}

function findOneById(id) {
  return AuditLog
    .findOne({ _id: id })
    .populate({ path: 'createdBy', select: 'userID' });
}

function find(query) {
  return AuditLog
    .find(query)
    .populate({ path: 'createdBy', select: 'userID' });
}
