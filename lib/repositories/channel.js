'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');
const mongoose = require('mongoose');
const Channel = models.Channel;

module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  getList
};

function create(payload) {
  return new Channel(payload).save();
}

function findById(payload) {
  return Promise.all([
    Channel.findOne({ _id: payload._id }).populate({ path: 'network' }).select("-__v ").lean(true)
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

  if (payload.searchCriteria.networkName) {
    query = _.merge({}, query, { 'networkName': payload.searchCriteria.networkName });
  }
  if (payload.searchCriteria.channelName) {
    query = _.merge({}, query, { 'channelName': payload.searchCriteria.channelName });
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
    Channel
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .populate({ path: 'createdBy', select: 'userID' })
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    Channel.count(query)
  ]);
}

function getList(payload) {

  let query = {};
  if (payload.codeList) {
    query = _.set(query, 'orgList', { "$in": payload.codeList })
  }
  if (payload.type) {
    query = _.set(query, 'type', payload.type);
  }
  let gte = {};
  let lte = {};
  return Channel
    .find(query)
    .populate({ path: 'createdBy', select: 'userID' })
    .sort('channelName')
    .lean(true)
    .exec();
}

function update(set) {
  return Channel.update({ _id: set._id || new mongoose.mongo.ObjectID() }, { $set: set }, { upsert: true });
}
