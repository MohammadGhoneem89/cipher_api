'use strict';

const lastReconConfig = require('../config/lastRecon');
const acquirerRepo = require('../../lib/repositories/acquirer');
const entityRepo = require('../../lib/repositories/entity');
const notificationsRepo = require('../../lib/repositories/notifications');
const groupRepo = require('../../lib/repositories/group');
const userRepo = require('../../lib/repositories/user');
const _ = require('lodash');
const email = require('../../lib/email');

module.exports = {
  init
};

function init() {
  sendLastReconNotifications()
    .then((res) => res)
    .catch((err) => {
      console.log('err', err); // eslint-disable-line no-console
    });
}

function sendLastReconNotifications() {
  let acquirers = [];
  let entities = [];
  return Promise.all([
    acquirerRepo.findReconNotifications(),
    entityRepo.findReconNotifications()
  ])
    .then((res) => {
      acquirers = res[0];
      entities = res[1];
      let orgCode = _.map(acquirers, 'shortCode');
      orgCode = _.concat(orgCode, _.map(entities, 'spCode'));
      return userRepo.find({ orgCode: { $in: orgCode } });
    })
    .then((users) => {
      let promises = [];
      if (lastReconConfig.notification.email) {
        promises = promises.concat([
          createEmailUpdateAcquirer(acquirers, users),
          createEmailUpdateEntity(entities, users)
        ]);
      }
      if (lastReconConfig.notification.inbox) {
        promises = promises.concat([
          createNotificationUpdateAcquirer(acquirers, users),
          createNotificationUpdateEntity(entities, users)
        ]);
      }
      return Promise.all(promises);
    });

  function createEmailUpdateAcquirer(acquirers, users) {
    if (!acquirers || !acquirers.length) {
      return Promise.resolve({ done: true });
    }
    const acquirer = acquirers.splice(0, 1)[0];
    const emails = [];
    for (const user of users) {
      emails.push({
        to: user.email,
        subject: 'Manual Recon',
        html: `<p>Dear ${user.firstName},</p><p>${lastReconConfig.info.text.replace('{type}', 'acquirer').replace('{name}', acquirer.acquirerName)}</p>`
      });
    }
    return email.sendMany(emails)
      .then(() => {
        const data = {
          recon: acquirer.recon
        };
        data.recon.lastNotification = 'initiated';
        return acquirerRepo.findOneAndUpdate({ _id: acquirer._id }, data);
      })
      .then(() => {
        return createNotificationUpdateAcquirer(acquirers, users);
      });
  }

  function createEmailUpdateEntity(entities, users) {
    if (!entities || !entities.length) {
      return Promise.resolve({ done: true });
    }
    const entity = entities.splice(0, 1)[0];
    const emails = [];
    for (const user of users) {
      emails.push({
        to: user.email,
        subject: 'Manual Recon',
        html: `<p>Dear ${user.firstName},</p><p>${lastReconConfig.info.text.replace('{type}', 'entity').replace('{name}', entity.entityName)}</p>`
      });
    }
    return email.sendMany(emails)
      .then(() => {
        const data = {
          recon: entity.recon
        };
        data.recon.lastNotification = 'initiated';
        return entityRepo.findOneAndUpdate({ _id: entity._id }, data);
      })
      .then(() => {
        return createNotificationUpdateEntity(entities, users);
      });
  }

  function createNotificationUpdateAcquirer(acquirers, users) {
    if (!acquirers || !acquirers.length) {
      return Promise.resolve({ done: true });
    }
    const acquirer = acquirers.splice(0, 1)[0];
    const notifications = [];
    for (const user of users) {
      notifications.push({
        text: lastReconConfig.info.text.replace('{type}', 'acquirer').replace('{name}', acquirer.acquirerName),
        action: lastReconConfig.info.action.replace('{code}', acquirer.shortCode).replace('{type}', 'Acquirer'),
        type: lastReconConfig.info.type,
        params: lastReconConfig.info.params,
        labelClass: lastReconConfig.info.labelClass,
        icon: lastReconConfig.info.icon,
        createdBy: lastReconConfig.info.createdBy,
        updatedBy: lastReconConfig.info.createdBy,
        userId: user._id,
        userID: user.userID
      });
    }
    return notificationsRepo.insertMany(notifications)
      .then(() => {
        const data = {
          recon: acquirer.recon
        };
        data.recon.lastNotification = 'initiated';
        return acquirerRepo.findOneAndUpdate({ _id: acquirer._id }, data);
      })
      .then(() => {
        return createNotificationUpdateAcquirer(acquirers, users);
      });
  }

  function createNotificationUpdateEntity(entities, users) {
    if (!entities || !entities.length) {
      return Promise.resolve({ done: true });
    }
    const entity = entities.splice(0, 1)[0];
    const notifications = [];
    for (const user of users) {
      notifications.push({
        text: lastReconConfig.info.text.replace('{type}', 'entity').replace('{name}', entity.entityName),
        action: lastReconConfig.info.action.replace('{code}', entity.spCode).replace('{type}', 'Entity'),
        type: lastReconConfig.info.type,
        params: lastReconConfig.info.params,
        labelClass: lastReconConfig.info.labelClass,
        icon: lastReconConfig.info.icon,
        createdBy: lastReconConfig.info.createdBy,
        userId: user._id,
        userID: user.userID
      });
    }
    return notificationsRepo.insertMany(notifications)
      .then(() => {
        const data = {
          recon: entity.recon
        };
        data.recon.lastNotification = 'initiated';
        return entityRepo.findOneAndUpdate({ _id: entity._id }, data);
      })
      .then(() => {
        return createNotificationUpdateEntity(entities, users);
      });
  }
}
