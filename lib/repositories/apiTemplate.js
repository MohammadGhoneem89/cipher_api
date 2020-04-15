'use strict';

const models = require('../models');
const _ = require('lodash');

const APITemplates = models.APITemplates;

module.exports = {
  findPageAndCount,
  upsert,
  findOne,
  findOneByName
};

function upsert(payload) {
  if (payload._id) {
    return APITemplates
      .findOneAndUpdate({ _id: payload._id }, payload);
  }
  return new APITemplates(payload).save();
}

function findPageAndCount(payload) {
  const query = {};
  if (_.get(payload, 'searchCriteria.name')) { query.name = { $regex: RegExp(payload.searchCriteria.name, 'gi'), $options: 'si' }; }
  return Promise.all([
    APITemplates
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .lean(true)
      .exec(),
    APITemplates.count(query)
  ]);
}

function findOne(payload) {
  if (!payload.id) {
    return Promise.resolve({});
  }
  return APITemplates
    .findOne({ _id: payload.id });
}

function findOneByName(payload) {
  if (!payload.name) {
    return Promise.resolve({});
  }
  return APITemplates
    .findOne({ name: payload.name });
}
