const mongo = require('./mongoose');
const amqp = require('./amqp');
const redis = require('./redis');
const pg = require('./pg');
const sequelize = require('./sequelize');

module.exports = {
    createClient: async function (type, connectionURL, QUEUE_NAME) {
        let client;
        switch (type) {
            case 'mongo':
                client = await mongo(connectionURL);
                break;
            case 'amqp':
                client = await amqp(connectionURL, QUEUE_NAME);
                break;
            case 'redis':
                client = await redis(connectionURL);
                break;
            case 'postgres':
            case 'pg':
                client = await pg(connectionURL);
                break;
            case 'sequelize':
                client = await sequelize(connectionURL);
                break;
        }
        return client;
    }
}