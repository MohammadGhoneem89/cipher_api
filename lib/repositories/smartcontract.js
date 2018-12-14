'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');
const mongoose = require('mongoose');
const SmartContract = models.SmartContract;

module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  findByIdDetail,
  getList,
  getListByChannel
};

function create(payload) {
  return new SmartContract(payload).save();
}
function findByIdDetail(payload) {
  return Promise.all([
    SmartContract.findOne({ _id: payload._id }).populate({ path: 'channelID' }).select("-__v ").lean(true)
  ])
    .then((res) => {
      if (!res[0]) {
        const err = { message: 'no record found' };
        throw err;
      }
      return res[0];
    });
}

function findById(payload) {
  return Promise.all([
    SmartContract.findOne({ _id: payload._id }).populate({ path: 'network' }).select("-__v ").lean(true)
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

  if (payload.searchCriteria.smartContract) {
    query = _.merge({}, query, { 'smartContract': payload.searchCriteria.smartContract });
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
    SmartContract
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .populate({ path: 'createdBy', select: 'userID' })
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    SmartContract.count(query)
  ]);
}

function getListByChannel(id) {
  const query = { channelID: id };
  let gte = {};
  let lte = {};
  return SmartContract
    .find(query)
    .sort('smartContract')
    .lean(true)
    .exec();
}
function getList(payload) {
  const query = {};
  let gte = {};
  let lte = {};
  return SmartContract
    .find(query)
    .sort('smartContract')
    .lean(true)
    .exec();
}

function update(set) {
  return SmartContract.update({ _id: set._id || new mongoose.mongo.ObjectID() }, { $set: set }, { upsert: true });
}
