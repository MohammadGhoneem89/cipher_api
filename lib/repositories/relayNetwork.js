'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');
const mongoose = require('mongoose');
const RelayNetwork = models.RelayNetwork;

module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  getList,
  find
};

function create(payload) {
  return new RelayNetwork(payload).save();
}

function findById(payload) {
  return Promise.all([
    RelayNetwork.findOne({ _id: payload._id }).select("-__v ").lean(true)
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

  if (payload.searchCriteria.dispatcherName) {
    query = _.merge({}, query, { 'networkName': payload.searchCriteria.networkName });
  }
  if (payload.searchCriteria.type) {
    query = _.merge({}, query, { 'mspid': payload.searchCriteria.mspid });
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
    RelayNetwork
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .populate({ path: 'createdBy', select: 'userID' })
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    RelayNetwork.count(query)
  ]);
}

function getList(payload) {
  const query = {};
  if (payload.type) {
    _.set(query, 'type', payload.type)
  }
  let gte = {};
  let lte = {};
  return RelayNetwork
    .find(query)
    .populate({ path: 'createdBy', select: 'userID' })
    .sort('networkName')
    .lean(true)
    .exec();
}

function update(set) {
  return RelayNetwork.update({ _id: set._id || new mongoose.mongo.ObjectID() }, { $set: set }, { upsert: true });
}

function find(query = {}) {
  return RelayNetwork
    .find(query)
    .sort('networkName')
    .lean(true)
    .exec();
}
