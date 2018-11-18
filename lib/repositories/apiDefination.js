'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');

const APIDefination = models.APIDefination;

module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  getServiceList,
  getActiveAPIList,
  getAPIConfig
};
function getAPIConfig(payload) {
  const query = {};
  return APIDefination
    .find(query)
    .populate({ path: 'RequestMapping'})
    .populate({ path: 'ResponseMapping' })
    .lean(true)
    .exec();
}

function getActiveAPIList(payload) {
  const query = {
    isActive: true
  };

  payload.useCase ? query.useCase = payload.useCase : false;
  payload.route ? query.route = payload.route : false;
  console.log(JSON.stringify(query))
  let gte = {};
  let lte = {};
  return APIDefination
    .find(query)
    .select("-__v -_id")
    .sort('useCase')
    .populate({ path: 'RequestMapping', select: '-__v -_id -createdBy' })
    .populate({ path: 'ResponseMapping', select: '-__v -_id -createdBy' })
    .lean(true)
    .exec();
}
function getServiceList() {
  const query = {
  };
  let gte = {};
  let lte = {};
  return APIDefination
    .find(query)
    .select('useCase route')
    .lean(true)
    .exec();
}

function create(payload) {
  return new APIDefination(payload).save();
}

function findById(payload) {
  return Promise.all([
    APIDefination.findOne({ route: payload.route, useCase: payload.useCase }).lean(true).select("-__v -_id")
  ])
    .then((res) => {
      return res[0];
    });
}

function findPageAndCount(payload) {
  let query = {};
  let gte = {};
  let lte = {};

  if (payload.searchCriteria.route) {
    query = _.merge({}, query, { 'route': payload.searchCriteria.route });
  }
  if (payload.searchCriteria.useCase) {
    query = _.merge({}, query, { 'useCase': payload.searchCriteria.useCase });
  }
  if (payload.searchCriteria.authorization) {
    query = _.merge({}, query, { 'dipatcher.authorization': payload.searchCriteria.authorization });
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
    APIDefination
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .select('useCase  route documentPath isActive isSimulated createdBy createdAt')
      .populate({ path: 'createdBy', select: 'userID' })
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    APIDefination.count(query)
  ]);
}

function update(query, set) {
  return APIDefination.update(query, { $set: set }, { upsert: true });
}