'use strict';
const factory = require('./core/api/client/index');
const config = require('./AppConfig');
const gConfig = require('./config');
const crypto = require('./lib/helpers/crypto');
const uuid = require('uuid/v1');
const logger = require('./core/api/connectors/logger').app;

const MQConnStr = crypto.decrypt(gConfig.get('amqp.url'));

const open = factory.createClient('amqp', MQConnStr);

let start = function (callback) {
  // Consumer
  if (config.EnableMQRead != "1") return;

  open.then(ch => {

    let queueName = config.MessageQueueInfo.Express_Read;
    return ch.assertQueue(queueName, {durable: false}).then(ok => {
      return ch.consume(queueName, msg => {
        logger.info({fs: 'MQListener.js', func: 'start'}, '[FPA] Waiting For Messages in: ', queueName);
        if (msg !== null) {
          callback(JSON.parse(msg.content.toString()));
          logger.info({fs: 'MQListener.js', func: 'start'}, '[FPA] Waiting For Messages in: ', queueName);
          ch.ack(msg);
        }
      });
    });
  }).catch(err => logger.error(err, 'amqp connection error'));
};

// Publisher

let getNewMessageForSubscription = function (eventname, subscriberId, params, uid) {

  let msgFormat = {
    "header": {
      "tranType": "0200",
      "tranCode": "4000",
      "timeStamp": Date(),
      "UUID": uuid(),
      "correlationId": ""

    },
    "body": {
      "action": "subscribe",
      "subscriberId": subscriberId,
      "event": eventname,
      "senderAddress": "",
      "timeStamp": Date(),
      "params": params
    }
  };
  return Object.assign({}, msgFormat);
};

let getNewMessageForUnsubscription = function (eventname, subscriberId, params) {

  let msgFormat1 = {
    "header": {
      "tranType": "0200",
      "tranCode": "4000",
      "timeStamp": Date(),
      "UUID": uuid(),
      "correlationId": ""
    },
    "body": {
      "action": "unsubscribe",
      "subscriberId": subscriberId,
      "event": eventname,
      "senderAddress": "",
      "timeStamp": Date(),
      "params": params
    }
  };

  return Object.assign({}, msgFormat1);
};

function startSend() {
  return openSend.connect(MQConnStr)
    .then((conn) => conn.createChannel())
    .catch((err) => {
      logger.error(err, '[AMQP] reconnecting error')
      return setTimeout(startSend, 1000);
    });
}

var MQOut = function (chSend, sendQueueName, Message) {

  if (sendQueueName == "") {
    sendQueueName = config.MessageQueueInfo.RealTime_Write;
  }
  chSend.assertQueue(sendQueueName, {durable: false});
  chSend.sendToQueue(sendQueueName, new Buffer(JSON.stringify(Message)));
};

let sendMessage = function (queueName, message) {

  //return;
  if (queueName == "") {
    queueName = config.MessageQueueInfo.RealTime_Write;
  }
  //sendResponse(MQConnStr ,queueName,message);
  return open.then(ch => {
    logger.info(message, 'message received');
    return ch.assertQueue(queueName, {durable: false}).then(ok => {
      ch.sendToQueue(queueName, new Buffer(JSON.stringify(message)));
      setTimeout(function () {
        ch.close();
      }, 500);
    });
  });
};

module.exports = {
  sendMessage,
  start,
  getNewMessageForSubscription,
  getNewMessageForUnsubscription,
  startSend,
  MQOut
};
