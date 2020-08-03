'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');
const ser = require('../constants/common');
const mongoose = require('mongoose');
const ADHReport = models.ADHReport;
const userRepo = require('../repositories/user');

module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  find
};

function create(payload) {
  return new ADHReport(payload).save();
}

function findById(payload) {
  return Promise.all([
    ADHReport.findOne({_id: payload._id}).select("-__v ").lean(true)
  ])
    .then((res) => {
      if (!res[0]) {
        const err = {message: 'no record found'};
        throw err;
      }
      return res[0];
    });
}

function findPageAndCount(payload, jwt) {
  console.log(JSON.stringify(jwt))
  let query = {};
  let gte = {};
  let lte = {};

  if (payload.searchCriteria.name) {
    query = _.merge({}, query, {'name': payload.searchCriteria.name});
  }
  if (payload.searchCriteria.reportType) {
    query = _.merge({}, query, {'reportType': payload.searchCriteria.reportType});
  }

  if (payload.searchCriteria.connectionType) {
    query = _.merge({}, query, {'connectionType': payload.searchCriteria.connectionType});
  }
  if (payload.searchCriteria.toDate) {
    lte = {$lte: dates.ddMMyyyyMS(payload.searchCriteria.toDate)};
  }
  query.createdAt = Object.assign(gte, lte);
  if (_.isEmpty(query.createdAt)) {
    delete query.createdAt;
  }
  return Promise.all([
    userRepo.findOneById(jwt._id),
    ADHReport
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .populate({path: 'createdBy', select: 'userID'})
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    ADHReport.count(query)
  ]);
}

function update(set) {
  return ADHReport.update({_id: set._id || new mongoose.mongo.ObjectID()}, {$set: set}, {upsert: true});
}

function find(query = {}) {
  return ADHReport
    .find(query)
    .sort('name')
    .lean(true)
    .exec();
}
