'use strict';

const models = require('../models');
const _ = require('lodash');

const EndpointDefination = models.EndpointDefination;

module.exports = {
  findPageAndCount,
  upsert,
  findOne,
  findByName
};

function upsert(payload) {
  if (payload._id) {
    delete payload.certificates;
    delete payload.certPhrase;
    return EndpointDefination
      .findOneAndUpdate({_id: payload._id}, payload);
  }

  return new EndpointDefination(payload).save();

}

function findPageAndCount(payload) {
  const query = {};
  if (_.get(payload, 'searchCriteria.address')) {query.address = { $regex: RegExp(payload.searchCriteria.address, 'gi'), $options: 'si' };}
  if (_.get(payload, 'searchCriteria.name')) {query.name = { $regex: RegExp(payload.searchCriteria.name, 'gi'), $options: 'si' };}

  return Promise.all([
    EndpointDefination
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .select({ certificates: 0, certPhrase: 0 })
      .lean(true)
      .exec(),
    EndpointDefination.count(query)
  ]);
}

function findOne(payload) {
  if (!payload.id) {
    return Promise.resolve({});
  }
  return EndpointDefination
    .findOne({_id: payload.id})
    .select({ certificates: 0, certPhrase: 0 });
}

function findByName(query) {
  return EndpointDefination
    .findOne(query);
}
