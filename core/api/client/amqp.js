const amqplib = require('amqplib');
const crypto = require('crypto');
var AMQPExistingList = {};
const amqp = require('amqp-connection-manager');
module.exports = async function (connectionURL) {
    const hash = crypto.createHash('md5').update(connectionURL).digest("hex");

    let connection = amqp.connect([connectionURL]);

    if (AMQPExistingList[hash]) {
        console.log('Returning a MQ instance');
    } else {
        let channelWrapper = connection.createChannel({
            json: true,
            setup: function (channel) {
                AMQPExistingList[hash] = channel;
                AMQPExistingList[hash].channelWrapper = channelWrapper;
            }
        });
        console.log('Creating a MQ instance');
    }
    return AMQPExistingList[hash];
};