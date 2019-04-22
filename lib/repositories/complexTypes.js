'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');

const ComplexTypes = models.ComplexTypes;

module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  getServiceList,
  findByRequestId,
  deleteAndInsert,
  findByComplexTypeIds
};

function create(payload) {
  return new ComplexTypes(payload).save();
}

function findById(payload) {
  return Promise.all([
    ComplexTypes.findOne({ typeName: payload.typeName }).lean(true)
  ])
    .then((res) => {
      return res[0];
    });
}
function findByComplexTypeIds(list) {

  return Promise.all([
    ComplexTypes.find({ _id: { $in: list } }).lean(true)
  ]).then((res) => {
    return res[0] || [];
  });
}

function findByRequestId(payload) {

  return Promise.all([
    ComplexTypes.findOne({ _id: payload._id }).lean(true)
  ])
    .then((res) => {
      return res[0];
    });
}

function findPageAndCount(payload) {
  let query = {};
  let gte = {};
  let lte = {};

  if (payload.searchCriteria.typeName) {
    query.typeName = { $regex: new RegExp(payload.searchCriteria.typeName, 'gi'), $options: 'si' };
    // query = _.merge({}, query, { 'mappingName': payload.searchCriteria.mappingName });
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
    ComplexTypes
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .populate({ path: 'createdBy', select: 'userID' })
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    ComplexTypes.count(query)
  ]);
}

function getServiceList() {
  const query = {};
  let gte = {};
  let lte = {};
  return ComplexTypes
    .find(query)
    .lean(true)
    .exec();
}

function update(query, set) {
  return ComplexTypes.update(query, { $set: set }, { upsert: true });
}

function deleteAndInsert(query, set) {
  return ComplexTypes.findOne(query).then((data) => {
    let queryUpsert = {}
    if (data && data._id) {
      queryUpsert = { _id: data._id };
    } else {
      queryUpsert = query;
    }
    return ComplexTypes.update(queryUpsert, { $set: set }, { upsert: true }).then((dataupsert) => {
      if (dataupsert && dataupsert.upserted) {
        return dataupsert.upserted[0];
      }
      return { _id: data._id };
    });
  });
}
