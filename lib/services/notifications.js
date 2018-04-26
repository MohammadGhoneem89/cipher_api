'use strict';

const validator = require('../validator');
const notificationsRepo = require('../repositories/notifications');
const userRepo = require('../repositories/user');
const entityRepo = require('../repositories/entity');
const emailTemplateRepo = require('../repositories/emailTemplate');
const groupRepo = require('../repositories/group');
const errors = require('../helpers/errors');
const dates = require('../helpers/dates');
const logger = require('../helpers/logger')();
const email = require('../email');
const _ = require('lodash');

module.exports = {
  create,
  find,
  findByUserID,
  markAsRead,
  spCodeMapping
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
      const promises = [userRepo.find(query)];
      if (payload.data.isEmail && payload.data.templateId) {
        promises.push(emailTemplateRepo.findAndFormat(payload.data.templateId, payload.data.templateParams));
      }
      return Promise.all(promises);
    })
    .then((res) => {
      const users = res[0];
      const template = res[1];
      if (!users.length) {
        return errors.notFound('user not found');
      }
      return checkAndCreateNoti(users, payload.data, template);
    });

  function checkAndCreateNoti(users, payloadData, template) {
    if (!users || !users.length) {
      return Promise.resolve();
    }
    const user = users.splice(0, 1)[0];
    const notification = {
      text: payloadData.text,
      action: payloadData.action,
      type: payloadData.type,
      params: payloadData.params,
      labelClass: payloadData.labelClass,
      createdBy: payloadData.createdBy,
      updatedBy: payloadData.updatedBy,
      userId: user._id,
      userID: user.userID
    };
    const query = {
      userId: notification.userId,
      userID: notification.userID,
      text: notification.text,
      createdAt: {
        $gte: dates.dayStartOf()
      }
    };
    return notificationsRepo.find(query)
      .then((notis) => {
        if (notis.length) {
          return Promise.resolve();
        }
        if (payloadData.isEmail && payloadData.templateId && user.email) {
          email.sendMany([{
            to: user.email,
            subject: template.subjectEng,
            html: template.templateTextEng
          }]);
        }
        return notificationsRepo.insertMany([notification]);
      })
      .then(() => {
        return checkAndCreateNoti(users, payloadData, template);
      });
  }
}

function markAsRead(payload) {
  return validator.validate(payload, validator.schemas.notifications.markAsRead)
    .then(() => {
      const query = {};
      if (payload.data._id) {
        query._id = payload.data._id;
      }
      if (payload.data.ids) {
        query._id = { $in: payload.data.ids };
      }
      if (payload.data.userID) {
        query.userID = payload.data.userID;
      }
      if (payload.data.userId) {
        query.userId = payload.data.userId;
      }
      if (_.isEmpty(query)) {
        throw '_id, ids, userID or userId is required';
      }
      return notificationsRepo.markAsRead(query);
    });
}

function find(payload) {
  return validator.validate(payload, validator.schemas.notifications.list)
    .then(() => {
      return notificationsRepo.findPageAndCount(payload);
    });
}

function findByUserID(payload) {
  return validator.validate(payload, validator.schemas.notifications.list)
    .then(() => {
      return notificationsRepo.findByUserID(payload);
    });
}

function spCodeMapping(spCode) {
  entityRepo.findOne({ spCode: spCode })
    .then((entity) => {
      if (!entity) {
        const payload = {
          action: 'createNotification',
          data: {
            groupName: 'Admin',
            text: `unidentified spcode found ${spCode}`,
            action: '',
            type: 'Error',
            params: '',
            labelClass: 'label label-sm label-danger',
            userID: 'system'
          }
        };
        return create(payload);
      }
      return true;
    })
    .catch((err) => {
      logger.app.error(`unidentified spcode found ${spCode}`, err);
    });
}
