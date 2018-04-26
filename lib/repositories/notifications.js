'use strict';

const models = require('../models');
const _ = require('lodash');
const amq = require('../../api/bootstrap/queue');
const appConfig = global.config;

const Notifications = models.Notifications;

module.exports = {
  create,
  insertMany,
  findPageAndCount,
  findByUserID,
  markAsRead,
  find
};

function create(payload) {
  sendToQueue([payload.data]);
  return new Notifications(payload.data).save();
}

function insertMany(notifications) {
  sendToQueue(notifications);
  return Notifications.insertMany(notifications);
}

function markAsRead(query) {
  return Notifications.update(query, { $set: { isRead: true } }, { multi: true });
}

function findPageAndCount(payload) {
  const query = { userId: payload.userId, isRead: payload.isRead };
  const sort = { createdAt: _.get(payload, 'sortBy.createdAt', 1) };
  const pageNo = payload.page.currentPageNo - 1;
  return Promise.all([
    Notifications
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * pageNo)
      .sort(sort)
      .lean(true)
      .exec(),
    Notifications.count(query)
  ]);
}

function findByUserID(payload) {
  const query = { userID: payload.userId, isRead: payload.isRead || false };
  const sort = { createdAt: _.get(payload, 'sortBy.createdAt', 1) };
  const pageNo = payload.page.currentPageNo - 1;
  return Promise.all([
    Notifications
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * pageNo)
      .sort(sort)
      .lean(true)
      .exec(),
    Notifications.count(query)
  ]);
}

function sendToQueue(notifications) {
  const queueName = appConfig.MessageQueueInfo.Express_Read;
  for (const notification of notifications) {
    const message = {};
    message.header = {
      action: 'NOTIFICATION'
    };
    message.body = {
      userID: notification.userID,
      MessageType: notification.type,
      MessageText: notification.text
    };
    let connection;
    amq.connect()
      .then((conn) => {
        connection = conn;
        return conn.createChannel();
      })
      .then((ch) => {
        return ch.assertQueue(queueName, { durable: false })
          .then(() => {
            ch.sendToQueue(queueName, new Buffer(JSON.stringify(message)));
            return ch.close();
          });
      })
      .then(() => connection.close());
  }
}

function find(query) {
  return Notifications.find(query);
}
