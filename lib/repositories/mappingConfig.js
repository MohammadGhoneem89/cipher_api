'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');

const MappingConfig = models.MappingConfig;

module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  getServiceList,
  findByRequestId,
  deleteAndInsert
};

function create(payload) {
  return new MappingConfig(payload).save();
}

function findById(payload) {
  return Promise.all([
    MappingConfig.findOne({ mappingName: payload.mappingName }).lean(true)
  ])
    .then((res) => {
      return res[0];
    });
}

function findByRequestId(payload) {

  return Promise.all([
    MappingConfig.findOne({ _id: payload._id, mappingType: "REQUEST" }).select("fields").lean(true)
  ])
    .then((res) => {
      return res[0];
    });
}

function findPageAndCount(payload) {
  let query = {};
  let gte = {};
  let lte = {};

  if (payload.searchCriteria.mappingName) {
    query.mappingName = { $regex: new RegExp(payload.searchCriteria.mappingName, 'gi'), $options: 'si' };
    // query = _.merge({}, query, { 'mappingName': payload.searchCriteria.mappingName });
  }
  if (payload.searchCriteria.mappingType && payload.searchCriteria.mappingType !== "ALL") {
    query.mappingType = { $regex: new RegExp(payload.searchCriteria.mappingType, 'gi'), $options: 'si' };
    // query = _.merge({}, query, { 'mappingType': payload.searchCriteria.mappingType });
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
    MappingConfig
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .select('_id mappingName useCase  mappingType fields createdBy updatedAt createdAt createdID')
      .populate({ path: 'createdBy', select: 'userID' })
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    MappingConfig.count(query)
  ]);
}

function getServiceList(mappingType) {
  const query = { mappingType: mappingType };
  let gte = {};
  let lte = {};
  return MappingConfig
    .find(query)
    .select('_id mappingName')
    .sort('mappingName')
    .lean(true)
    .exec();
}

function update(query, set) {
  return MappingConfig.update(query, { $set: set }, { upsert: true });
}

function deleteAndInsert(query, set) {
  return MappingConfig.findOne(query).then((data) => {
    let queryUpsert = {}
    if (data && data._id) {
      queryUpsert = { _id: data._id };
    } else {
      queryUpsert = query;
    }
    return MappingConfig.update(queryUpsert, { $set: set }, { upsert: true }).then((dataupsert) => {
      if (dataupsert && dataupsert.upserted) {
        return dataupsert.upserted[0];
      }
      return { _id: data._id };
    });
  });
}
