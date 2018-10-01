'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');

const eventDispatcher = models.EventDispatcher;

module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  getList
};

function create(payload) {
  return new eventDispatcher(payload).save();
}

function findById(payload) {
  return Promise.all([
    eventDispatcher.findOne({dispatcherName: payload.dispatcherName}).lean(true)
  ])
    .then((res) => {
      if (!res[0]) {
        const err = {message: 'no record found'};
        throw err;
      }
      return res[0];
    });
}

function findPageAndCount(payload) {
  const query = {};
  let gte = {};
  let lte = {};

  if (payload.searchCriteria.dispatcherName) {
    query = _.merge({}, query, {'dispatcherName': payload.searchCriteria.dispatcherName});
  }
  if (payload.searchCriteria.dispatchFunction) {
    query = _.merge({}, query, {'dispatchFunction': payload.searchCriteria.dispatchFunction});
  }
  if (payload.searchCriteria.fromDate) {
    gte = {$gte: dates.ddMMyyyyMS(payload.searchCriteria.fromDate)};
  }
  if (payload.searchCriteria.toDate) {
    lte = {$lte: dates.ddMMyyyyMS(payload.searchCriteria.toDate)};
  }
  query.createdAt = Object.assign(gte, lte);
  if (_.isEmpty(query.createdAt)) {
    delete query.createdAt;
  }
  return Promise.all([
    eventDispatcher
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .select('dispatcherName createdBy dispatchFunction filePath updatedAt createdAt createdID')
      .populate({path: 'createdBy', select: 'userID'})
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    eventDispatcher.count(query)
  ]);
}

function getList(payload) {
  const query = {};
  let gte = {};
  let lte = {};

  return eventDispatcher
    .find(query)
    .select('dispatcherName createdBy dispatchFunction filePath updatedAt createdAt createdID')
    .populate({path: 'createdBy', select: 'userID'})
    .sort('dispatcherName')
    .lean(true)
    .exec();
}

function update(query, set) {
  return eventDispatcher.update(query, {$set: set}, {upsert: true});
}
