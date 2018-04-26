'use strict';

const slaEvent = require('../../lib/repositories/slaEvent');
const slaEventConst = require('../config/slaEvent');
const emailTemplateRepo = require('../../lib/repositories/emailTemplate');
const dates = require('../../lib/helpers/dates');
const couchSelect = require('../../lib/couch/find');
const _ = require('lodash');
const channels = require('../../lib/constants/channels');
const email = require('../../lib/email');
const groupRepo = require('../../lib/repositories/group');
const userRepo = require('../../lib/repositories/user');
const notificationsRepo = require('../../lib/repositories/notifications');

module.exports = {
  init
};

function init() {
  const query = {
    SLABurstTime: { $lte: dates.newDate() },
    SLABreached: false,
    isProcessed: false
  };
  let slaEvents;
  slaEvent.find(query)
    .then((res) => {
      slaEvents = res;
      const refNums = _.map(res, 'refNum');
      return couchSelect(channels.transactions, { 'data.PayRef': { $in: refNums } });
    })
    .then((transactions) => {
      const promises = [];
      for (const transaction of transactions) {
        const slaEvent = _.find(slaEvents, { refNum: _.get(transaction, 'data.PayRef') });
        if (slaEvent) {
          if (_.get(transaction, 'data.Status') === _.get(slaEvent, 'currentState')) {
            promises.push(sendNotifications(slaEvent._id));
          }
          else {
            promises.push(updateSLAEvent({ _id: slaEvent._id }, { isProcessed: true }));
          }
        }
      }
      return Promise.all(promises);
    })
    .catch((err) => {
      console.log('ERROR SLAEvent ', err); // eslint-disable-line no-console
    });

  function sendNotifications(slaEventId) {
    return groupRepo.find({ name: { $in: slaEventConst.info.groups } })
      .then((groups) => {
        const groupIds = _.map(groups, '_id');
        const query = { $or: [
          { groups: { $in: groupIds } },
          { userID: { $in: slaEventConst.info.users } }
        ] };
        return Promise.all([
          userRepo.find(query),
          emailTemplateRepo.findOneById(slaEventConst.notification.emailTemplateId)
        ]);
      })
      .then((res) => {
        const users = res[0];
        const emailTemplate = res[1];
        const promises = [];
        if (slaEventConst.notification.email) {
          sendEmail(users, emailTemplate);
        }
        if (slaEventConst.notification.inbox) {
          promises.push(sendInbox(users));
        }
        promises.push(updateSLAEvent({ _id: slaEventId }, { SLABreached: true }));
        return Promise.all(promises);
      });

    function sendEmail(users, emailTemplate) {
      const emails = [];
      for (const user of users) {
        emails.push({
          to: user.email,
          subject: 'SLAEvent Breached',
          html: emailTemplate.templateTextEng
        });
      }
      return email.sendMany(emails);
    }

    function sendInbox(users) {
      const notifications = [];
      for (const user of users) {
        notifications.push({
          text: '',
          action: '',
          type: '',
          params: '',
          labelClass: '',
          icon: '',
          createdBy: '',
          updatedBy: '',
          userId: user._id,
          userID: user.userID
        });
      }
      return notificationsRepo.insertMany(notifications);
    }
  }

  function updateSLAEvent(query, payload) {
    return slaEvent.findOneAndUpdate(query, payload);
  }
}
