'use strict';

const models = require('../models');

const Group = models.Group;

module.exports = {
  find,
  findOneAndUpdate,
  create,
  findOneById,
  findPageAndCount,
  findOneByName
};

function find(query, attrs = '', lean = false) {
  query = query || {};
  return Group
    .find(query)
    .select(attrs)
    .lean(lean);
}

function findOneAndUpdate(query, payload) {
  return Group
    .findOneAndUpdate(query, payload);
}

function create(payload) {
  return new Group(payload).save();
}

function findOneById(id) {
  return Group.findOne({ _id: id }).lean(true);
}
function findOneByName(name) {
  return Group.findOne({ name: name }).lean(true);
}
function findPageAndCount(payload) {
  const query = {};
  if (payload.searchCriteria.name) {
    query.name = { $regex: RegExp(payload.searchCriteria.name), $options: 'si' };
  }
  if (payload.searchCriteria.description) {
    query.description = { $regex: RegExp(payload.searchCriteria.description), $options: 'si' };
  }
  if (payload.searchCriteria.type) {
    query.type = { $regex: RegExp(payload.searchCriteria.type), $options: 'si' };
  }
  const pageNo = payload.page.currentPageNo - 1;
  return Promise.all([
    Group
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * pageNo)
      .lean(true)
      .select('name description type')
      .exec(),
    Group.count(query)
  ]);
}
