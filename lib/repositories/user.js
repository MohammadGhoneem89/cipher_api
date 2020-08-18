'use strict';

const models = require('../models');
const _ = require('lodash');
const config = require('../../config');
const { promise } = require('when');
const User = models.User;
const UserInterm = models.User_Interm;
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
  findOneAndUpdateInterm,
  getGroupsByOrgCode,
  findAll,
  findOneAndApprove,
  findOneAndReject
};

function find(query, attrs = '', lean = false) {
  query = query || {};
  attrs = attrs || { password: 0, passwordHashType: 0 };
  return User
    .find(query)
    .select(attrs)
    .populate({ path: 'groups', select: attrs })
    .lean(lean);
}

function findPageAndCount(payload, JWToken = undefined) {
  const query = {};
  if (payload.searchCriteria.userID) {
    query.userID = { $regex: RegExp(payload.searchCriteria.userID), $options: 'si' };
  }
  if (payload.searchCriteria.firstName) {
    query.firstName = { $regex: RegExp(payload.searchCriteria.firstName), $options: 'si' };
  }
  if (payload.searchCriteria.lastName) {
    query.lastName = { $regex: RegExp(payload.searchCriteria.lastName), $options: 'si' };
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
    // query.orgCode = payload.searchCriteria.orgCode;
  }
  if (payload.searchCriteria.userType) {
    query.userType = payload.searchCriteria.userType;
  }
  if (payload.searchCriteria.status) {
    query.status = payload.searchCriteria.status;
  }


  if (payload.searchCriteria.status && (payload.searchCriteria.status == "PENDING" || payload.searchCriteria.status == "REJECTED")) {
    console.log(JSON.stringify(query));
    return Promise.all([
      UserInterm
        .find(query)
        .limit(payload.page.pageSize)
        .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
        .select({ password: 0, passwordHashType: 0, passwordReset: 0 })
        .lean(true)
        .exec(),
      UserInterm.count(query)
    ])
  } else {
    return Promise.all([
      User
        .find(query)
        .limit(payload.page.pageSize)
        .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
        .select({ password: 0, passwordHashType: 0, passwordReset: 0 })
        .lean(true)
        .exec(),
      User.count(query)
    ]);
  }

}

function create(payload, errorMsg = { userID: 'userID Already exists' }) {
  return User.findOne({ userID: payload.userID })
    .then((user) => {
      if (user) {
        throw errorMsg;
      }
      if (payload.userType != 'API')
        _.set(payload, 'isNewUser', true);
      _.set(payload, 'status', 'PENDING');
      return new UserInterm(payload).save();
    });
}

function findOneById(id) {
  return User
    .findOne({ _id: id })
    .select({ password: 0, passwordHashType: 0, __v: 0 }).lean(true);
}

function getGroups(query, attrs = '', lean = false) {
  console.log(JSON.stringify(query))
  if (query.mode == 'checker') {
    delete query.mode;
    return UserInterm
      .findOne(query)
      .populate({ path: 'groups', select: attrs })
      .select({ password: 0, passwordHashType: 0, __v: 0 })
      .lean(lean);
  } else {
    return User
      .findOne(query)
      .populate({ path: 'groups', select: attrs })
      .select({ password: 0, passwordHashType: 0, __v: 0 })
      .lean(lean);
  }
}

function getGroupsByOrgCode(query) {
  console.log('>>>>>>>>>!!!!', query);
  return User
    .distinct('groups', query);
}

function findOneAndUpdate(query, payload) {
  console.log(query, 'QR');
  console.log(payload, 'PL');
  return User.findOne({ userID: payload.userID, _id: { $ne: query._id } })
    .then((user) => {
      return User
        .findOneAndUpdate(query, payload)
        .select({ password: 0, passwordHashType: 0 });
    });
}

function findOneAndUpdateInterm(query, payload) {
  console.log(query, 'QR>');
  console.log(payload, 'PL');
  return UserInterm.findOne({ userID: payload.userID })
    .then((user) => {
      if (user) {
        if (user.status != "REJECTED") {
          const error = { password: 'Pending record Already exists' };
          throw error;
        }
      }
      _.set(payload, 'status', 'PENDING');
      _.set(payload, '__v', undefined);

      let obj = _.cloneDeep(payload)
      return UserInterm
        .update({ _id: obj._id }, { $set: obj }, { upsert: true })
        .select({ password: 0, passwordHashType: 0 });
    });
}

function findOneAndApprove(query, payload) {
  console.log(query, 'QR');
  console.log(payload, 'PL');
  return UserInterm.findOne({ _id: query._id }).select({ __v: 0, _v: 0 })
    .then(async (user) => {
      if (user) {
        _.set(user, 'status', 'APPROVED');
        _.set(user, 'isNewUser', false);
        await UserInterm.deleteOne({ _id: user._id })
        await User.update({ _id: user._id }, { $set: user }, { upsert: true });
        return user
      } else {
        const error = { userID: 'userId does not exists' };
        throw error;
      }
    });
}


function findOneAndReject(query, payload) {
  console.log(query, 'QR');
  console.log(payload, 'PL');
  return UserInterm.findOne({ _id: query._id })
    .then((user) => {
      console.log(JSON.stringify(user), 'PLOP');
      if (user) {
        _.set(user, 'rejectionReason', query.rejectionReason);
        _.set(user, 'status', 'REJECTED');
        if (query.rejectionReason) {
          delete query.rejectionReason
        }


        return UserInterm
          .findOneAndUpdate(query, user)
          .select({ password: 0, passwordHashType: 0 });
      } else {
        const error = { userID: 'userId does not exists' };
        throw error;
      }
    });
}


function findOne(query, lean = false) {
  return User
    .findOne(query)
    .select({ password: 0, passwordHashType: 0 })
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
    .select({ orgType: 1, orgCode: 1, userID: 1, profilePic: 1, firstName: 1, lastName: 1, email: 1 });
}

function findAll(query, attrs = '') {
  query = query || {};
  attrs = attrs || { password: 0, passwordHashType: 0 };
  return User
    .find(query)
    .select(attrs);
}
