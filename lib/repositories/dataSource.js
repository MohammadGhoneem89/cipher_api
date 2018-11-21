'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');

const dataSource = models.DataSource;

module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  getList,
  getServiceList
};

function create(payload) {
  return new dataSource(payload).save();
}

function findById(id) {
  return Promise.all([
    dataSource.findOne(id).lean(true)
  ])
    .then((res) => {
      if (!res[0]) {
        const err = { message: 'no record found' };
        throw err;
      }
      return res[0];
    });
}

function findPageAndCount(payload) {
  let query = {};
  let gte = {};
  let lte = {};

  if (payload.searchCriteria.dataSourceName) {
    query = _.merge({}, query, { 'dataSourceName': payload.searchCriteria.dataSourceName });
  }
  if (payload.searchCriteria.sourceFunction) {
    query = _.merge({}, query, { 'sourceFunction': payload.searchCriteria.sourceFunction });
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
    dataSource
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .select('dataSourceName createdBy sourceFunction filePath updatedAt createdAt createdID')
      .populate({ path: 'createdBy', select: 'userID' })
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    dataSource.count(query)
  ]);
}

function getList() {
  const query = {};
  let gte = {};
  let lte = {};


  return dataSource
    .find(query)
    //.select('dataSourceName createdBy sourceFunction filePath updatedAt createdAt createdID')
    .populate({ path: 'createdBy', select: 'userID' })
    .sort('dataSourceName')
    .lean(true)
    .exec()

}

function getServiceList() {
  const query = {};
  let gte = {};
  let lte = {};

  return dataSource
    .find(query)
    .select('-sourceDataDefination')
    .sort('dataSourceName')
    .lean(true)
    .exec();
}

function update(query, set) {
  return dataSource.update(query, { $set: set }, { upsert: true });
}
