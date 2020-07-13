'use strict';

const validator = require('../validator');
const notificationsRepo = require('../repositories/notifications');
const userRepo = require('../repositories/user');
const groupRepo = require('../repositories/group');
const errors = require('../helpers/errors');
const logger = require('../helpers/logger')();

module.exports = {
  create,
  find,
  findByUserID,
  markAsRead
};

function create(payload) {
  let query = {};
  return validator.validate(payload, validator.schemas.notifications.create)
    .then(() => {
      if (payload.data.groupName) {
        return groupRepo.find({ name: payload.data.groupName });
      }
      return Promise.resolve([]);
    })
    .then((group) => {
      payload.data.groups = payload.data.groups || [];
      if (group.length) {
        payload.data.groups = payload.data.groups.concat([group[0]._id]);
      }
      payload.data.createdBy = payload.userId;
      payload.data.updatedBy = payload.userId;
      const orQuery = [];
      if (payload.data.groups.length) {
        orQuery.push({ groups: { $in: payload.data.groups } });
      }
      if (payload.data.userID) {
        orQuery.push({ userID: payload.data.userID });
      }
      if (payload.data.userId) {
        orQuery.push({ _id: payload.data.userId });
      }
      if (payload.data.orgCode) {
        orQuery.push({ orgCode: payload.data.orgCode });
      }
      if (!orQuery.length) {
        return errors.notFound('user not found');
      }
      query = { $or: orQuery };
      query = JSON.parse(JSON.stringify(query));
      return userRepo.find(query);
    })
    .then((users) => {
      if (!users.length) {
        return errors.notFound('user not found');
      }
      const notifications = [];
      for (const user of users) {
        notifications.push({
          text: payload.data.text,
          action: payload.data.action,
          type: payload.data.type,
          params: payload.data.params,
          labelClass: payload.data.labelClass,
          createdBy: payload.data.createdBy,
          updatedBy: payload.data.updatedBy,
          userId: user._id,
          userID: user.userID
        });
      }
      return notificationsRepo.insertMany(notifications);
    });
}

function markAsRead(query) {
  return notificationsRepo.markAsRead(query);
}

function find(payload) {
  return validator.validate(payload, validator.schemas.notifications.list)
    .then(() => {
      return notificationsRepo.findPageAndCount(payload);
    });
}

function findByUserID(payload) {
  return notificationsRepo.findByUserID(payload);
}
