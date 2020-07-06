const amqplib = require('amqplib');
const crypto = require('crypto');
var AMQPExistingList = {};
const amqp = require('amqp-connection-manager');
module.exports = async function (connectionURL, QUEUE_NAME) {
  const hash = crypto.createHash('md5').update(connectionURL).digest("hex");

  let connection = await amqp.connect([connectionURL]);
  connection.on('connect', () => console.log('Connected!'));
  connection.on('disconnect', (err) => {
    console.log('Disconnected.', err)
  });
  if (AMQPExistingList[hash]) {
    console.log('Returning a MQ instance');
  } else {
    return new Promise((resolve, reject) => {
      let channelWrapper = connection.createChannel({
        json: true,
        setup: channel => {
          // return channel.assertQueue(QUEUE_NAME, { durable: true });
        }
      });
      return resolve(channelWrapper, connection)
    })
  }
  return AMQPExistingList[hash];
};