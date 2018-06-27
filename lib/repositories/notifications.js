'use strict';

const models = require('../models');
const _ = require('lodash');
const amq = require('../../Core/api/bootstrap/queue');
const appConfig = require('../../AppConfig');

const Notifications = models.Notifications;

module.exports = {
    create,
    insertMany,
    findPageAndCount,
    findByUserID,
    markAsRead
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
    return Notifications.update(query,{ $set: {isRead: true} }, { multi: false });
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
    const query = { userID: payload.userId, isRead: payload.isRead };
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
        amq.start()
            .then((ch) => {
                ch.assertQueue(queueName, { durable: false })
                    .then(() => {
                        ch.sendToQueue(queueName, new Buffer(JSON.stringify(message)));
                        ch.close();
                    });
            });
    }
}
