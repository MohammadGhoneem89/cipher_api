const redis = require("redis");
const crypto = require('crypto');
var RDExistingList = {};

module.exports = async function (connectionURL) {
    const hash = crypto.createHash('md5').update(connectionURL).digest("hex");

    const createNewInstance = async () => {
        let client = await redis.createClient(connectionURL);
        RDExistingList[hash] = client;
        client.on('end', async () => {
            console.log('Recreating connection');
            await createNewInstance();
        });
        client.on('error', async (err) => {
            console.log('Error in redis', err);
        });
    }

    if (RDExistingList[hash]) {
        console.log('Returning an existing Redis instance');
    } else {
        console.log('Creating a Redis instance');
        await createNewInstance();
    }

    return RDExistingList[hash];
}