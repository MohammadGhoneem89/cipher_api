'use strict';

const models = require('../models');
const _ = require('lodash');
const config = require('../../config');
const User = models.User;
module.exports = {
  find,
  findPageAndCount,
  create,
  findOneById,
  getGroups,
  findOne,
  findOneAndUpdate,
  findOneWithPass,
  update,
  findForBasicDetail,
  getGroupsByOrgCode,
  findAll
};

function find(query, attrs = '', lean = false) {
  query = query || {};
  attrs = attrs || {password: 0, passwordHashType: 0};
  return User
    .find(query)
    .select(attrs)
    .populate({path: 'groups', select: attrs})
    .lean(lean);
}

function findPageAndCount(payload, JWToken = undefined) {
  const query = {};
  if (payload.searchCriteria.userID) {
    query.userID = {$regex: RegExp(payload.searchCriteria.userID), $options: 'si'};
  }
  if (payload.searchCriteria.firstName) {
    query.firstName = {$regex: RegExp(payload.searchCriteria.firstName), $options: 'si'};
  }
  if (payload.searchCriteria.lastName) {
    query.lastName = {$regex: RegExp(payload.searchCriteria.lastName), $options: 'si'};
  }
  if (payload.searchCriteria.isActive) {
    query.status = payload.data.isActive;
  }
  let ownOrg = config.get('ownerOrgs', [])
  if (JWToken && ownOrg.indexOf(JWToken.orgCode) == -1) {
    query.orgCode = JWToken.orgCode;
  }
  if (payload.searchCriteria.orgType) {
    query.orgType = payload.searchCriteria.orgType;
  }
  if (payload.searchCriteria.orgCode) {
    query.orgCode = payload.searchCriteria.orgCode;
  }
  if (payload.searchCriteria.userType) {
    query.userType = payload.searchCriteria.userType;
  }
  return Promise.all([
    User
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .select({password: 0, passwordHashType: 0})
      .lean(true)
      .exec(),
    User.count(query)
  ]);
}

function create(payload, errorMsg = {userID: 'userID Already exists'}) {
  return User.findOne({userID: payload.userID})
    .then((user) => {
      if (user) {
        throw errorMsg;
      }
      _.set(payload, 'isNewUser', true);
      return new User(payload).save();
    });
}

function findOneById(id) {
  return User
    .findOne({_id: id})
    .select({password: 0, passwordHashType: 0});
}

function getGroups(query, attrs = '', lean = false) {
  return User
    .findOne(query)
    .populate({path: 'groups', select: attrs})
    .select({password: 0, passwordHashType: 0})
    .lean(lean);
}

function getGroupsByOrgCode(query) {
  console.log('>>>>>>>>>!!!!',query);
  return User
    .distinct('groups', query);
}

function findOneAndUpdate(query, payload) {
  console.log(query, 'QR');
  console.log(payload, 'PL');
  return User.findOne({userID: payload.userID, _id: {$ne: query._id}})
    .then((user) => {
      if (user) {
        const error = {userID: 'userID Already exists'};
        throw error;
      }
      return User
        .findOneAndUpdate(query, payload)
        .select({password: 0, passwordHashType: 0});
    });
}

function findOne(query, lean = false) {
  return User
    .findOne(query)
    .select({password: 0, passwordHashType: 0})
    .lean(lean);
}

function update(query, doc) {
  return User
    .update(query, doc);
}

function findOneWithPass(query) {
  console.log(query, 'QUERY');
  // console.log(doc, 'DOC');
  return User
    .findOne(query).lean();
}

function findForBasicDetail(query) {
  return User
    .findOne(query)
    .select({orgType: 1, orgCode: 1, userID: 1, profilePic: 1, firstName: 1, lastName: 1, email: 1});
}

function findAll(query, attrs = '') {
  query = query || {};
  attrs = attrs || {password: 0, passwordHashType: 0};
  return User
    .find(query)
    .select(attrs);
}
