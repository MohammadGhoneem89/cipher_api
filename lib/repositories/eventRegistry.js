'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');

const eventRegistry = models.EventRegistry;

module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  getServiceList
};

function create(payload) {
  return new eventRegistry(payload).save();
}

function findById(payload) {
  return Promise.all([
    eventRegistry.findOne({eventName: payload.eventName}).lean(true)
  ])
    .then((res) => {
      //if (!res[0]) {
      //const err = { message: 'no record found' };
      //throw err;
      //}
      return res[0];
    });
}

function findPageAndCount(payload) {
  let query = {};
  let gte = {};
  let lte = {};

  if (payload.searchCriteria.eventName) {
    query = _.merge({}, query, {'eventName': payload.searchCriteria.eventName});
  }
  if (payload.searchCriteria.dataSourceName) {
    query = _.merge({}, query, {'dataSource.dataSourceName': payload.searchCriteria.dataSourceName});
  }
  if (payload.searchCriteria.dispatcherName) {
    query = _.merge({}, query, {'dipatcher.dispatcherName': payload.searchCriteria.dispatcherName});
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
    eventRegistry
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .select('eventName  dataSource.dataSourceName dipatcher.dispatcherName isActive createdBy updatedAt createdAt createdID')
      .populate({path: 'createdBy', select: 'userID'})
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    eventRegistry.count(query)
  ]);
}

function getServiceList() {
  const query = {
    isActive: true
  };
  let gte = {};
  let lte = {};


  return eventRegistry
    .find(query)
    .select('eventName dataSource dipatcher rule')
    .sort('eventName')
    .lean(true)
    .exec()
}

function update(query, set) {
  return eventRegistry.update(query, {$set: set}, {upsert: true});
}
