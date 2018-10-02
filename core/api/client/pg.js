const pg = require("pg");
const crypto = require('crypto');
var PGExistingList = {};

module.exports = async function (connectionURL) {
    const hash = crypto.createHash('md5').update(connectionURL).digest("hex");
    const createNewInstance = async () => {
        let client = new pg({
            connectionString: connectionURL,
        });
        PGExistingList[hash] = await client.connect();
        client.on('error', async (err) => {
            console.error('something bad has happened!', err.stack);
            await createNewInstance();
        })
    }

    if (PGExistingList[hash]) {
        console.log('Returning an existing Redis instance');
    } else {
        console.log('Creating a Redis instance');
        await createNewInstance();
    }
    return PGExistingList[hash];
}