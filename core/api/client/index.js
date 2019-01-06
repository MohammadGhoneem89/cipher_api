const mongo = require('./mongoose');
const amqp = require('./amqp');
const redis = require('./redis');
const pg = require('./pg');

module.exports = {
    createClient: async function (type, connectionURL) {
        let client;
        switch (type) {
            case 'mongo':
                client = await mongo(connectionURL);
                break;
            case 'amqp':
                client = await amqp(connectionURL);
                break;
            case 'redis':
                client = await redis(connectionURL);
                break;
            case 'pg':
                client = await pg(connectionURL);
                break;
            case 'postgres':
                client = await pg(connectionURL);
            break;
        }
        return client;
    }
}