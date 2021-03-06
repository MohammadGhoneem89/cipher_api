'use strict';

const models = require('../models');
const _ = require('lodash');
const commonConst = require('../constants/common');
const dates = require('../helpers/dates');
const mongoose = require('mongoose');
const ConsortiumConfig = models.ConsortiumConfig;
const channel = models.Channel;
const network = models.NetworkConfig;
const smartContract = models.SmartContract;
module.exports = {
  create,
  update,
  findPageAndCount,
  findById,
  getList,
  findByIdDetail
};

function create(payload) {
  return new ConsortiumConfig(payload).save();
}

function findById(payload) {
  return Promise.all([
    ConsortiumConfig.findOne({ _id: payload._id }).populate({ path: 'network' }).select("-__v ").lean(true)
  ])
    .then((res) => {
      if (!res[0]) {
        const err = { message: 'no record found' };
        throw err;
      }
      return res[0];
    });
}
function findByIdDetail(payload) {
  return Promise.all([
    ConsortiumConfig.findOne({ _id: payload._id }).populate({ path: 'createdBy' }).select("-__v ").lean(true)
  ]).then((res) => {
    if (!res[0]) {
      const err = { message: 'no record found' };
      throw err;
    };
    let networkList = [];
    return Promise.all([channel.find({ _id: { $in: res[0].selectedChannelList } }).populate({ path: 'createdBy', select: 'userID' }).lean(true).exec().then((data) => {
      data.forEach((elem) => {
        networkList.push(elem.network);
      });
      return {
        channelData: data,
        networkList: networkList
      };
    }).then((data) => {
      return network.find({ _id: { $in: data.networkList } }).populate({ path: 'createdBy', select: 'userID' }).lean(true).exec().then((result) => {
        return {
          networkData: result,
          channelData: data.channelData
        };
      });
    }).then((dataFinal) => {
      return {
        consortiumData: res[0],
        networkData: dataFinal.networkData,
        channelData: dataFinal.channelData
      };
    }),
    smartContract.find({ channelID: { $in: res[0].selectedChannelList } }).populate({ path: 'createdBy', select: 'userID' }).lean(true).exec()]).then((data) => {
      let finalObj = _.cloneDeep(data[0]);
      _.set(finalObj, 'smartContractList', data[1])
      return finalObj;
    });
  });
}

function findPageAndCount(payload) {
  let query = {};
  let gte = {};
  let lte = {};

  if (payload.searchCriteria.ConsortiumName) {
    query = _.merge({}, query, { 'ConsortiumName': payload.searchCriteria.ConsortiumName });
  }
  if (payload.searchCriteria.type) {
    query = _.merge({}, query, { 'type': payload.searchCriteria.type });
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
    ConsortiumConfig
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .populate({ path: 'createdBy', select: 'userID' })
      .sort(payload.page.sortData)
      .lean(true)
      .exec(),
    ConsortiumConfig.count(query)
  ]);
}

function getList(payload) {

  let query = {};
  if (payload.codeList) {
    query = _.set(query, 'orgList', { "$in": payload.codeList })
  }
  let gte = {};
  let lte = {};
  return ConsortiumConfig
    .find(query)
    .populate({ path: 'selectedChannelList' })
    .lean(true)
    .exec();
}

function update(set) {
  return ConsortiumConfig.update({ _id: set._id || new mongoose.mongo.ObjectID() }, { $set: set }, { upsert: true });
}
