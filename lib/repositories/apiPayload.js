'use strict';

const models = require('../models');
const dates = require('../helpers/dates');
const _ = require('lodash');

const APIPayload = models.APIPayload;

module.exports = {
  create,
  findPageAndCount,
  findOne,
  find,
  update
};

function create(payload) {
  return new APIPayload(payload).save();
}

function findPageAndCount(payload) {
  const query = {};
  let gte = {};
  let lte = {};
  if (payload.searchCriteria.uuid) {
    query.uuid = { $regex: new RegExp(payload.searchCriteria.uuid, 'gi'), $options: 'si' };
  }
  if (payload.searchCriteria.channel) {
    query.channel = { $regex: new RegExp(payload.searchCriteria.channel, 'gi'), $options: 'si' };
  }
  if (payload.searchCriteria.action) {
    query.action = { $regex: new RegExp(payload.searchCriteria.action, 'gi'), $options: 'si' };
  }
  if (payload.searchCriteria.payloadField && payload.searchCriteria.payloadFieldValue) {
    query[`payload.${payload.searchCriteria.payloadField}`] = { $regex: new RegExp(payload.searchCriteria.payloadFieldValue, 'gi'), $options: 'si' };
  }
  if (payload.searchCriteria.actions) {
    query.action = { $in: payload.searchCriteria.actions };
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
    APIPayload
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .select('uuid channel action createdAt payload')
      .lean(true)
      .exec(),
    APIPayload.count(query)
  ]);
}

function findOne(query) {
  return APIPayload.findOne(query);
}

function find(query) {
  return APIPayload.find(query);
}

function update(query, set) {
  return APIPayload.update(query, set);
}
