'use strict';

var logger = require('../lib/helpers/logger')().app;

var MQOut = function (chSend,sendQueueName,Message){
    chSend.assertQueue(sendQueueName, {durable: false});
    chSend.sendToQueue(sendQueueName, new Buffer(JSON.stringify(Message)));
    logger.info({fs: 'MQSendResponse.js', func: 'MQOut'}, " [sendResponse] Request Message Sent Successfully To MQ!!!'");
};



exports.MQOut = MQOut;

