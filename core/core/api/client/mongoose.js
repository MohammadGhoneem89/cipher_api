const mongoose = require('mongoose');
const crypto = require('crypto');
var MGExistingList = {};

module.exports = async function (connectionURL) {
    const createConnection =  async () => {
        await mongoose.connect(connectionURL, { useNewUrlParser: true, reconnectTries: 10 });
        mongoose.Promise = global.Promise;
        return mongoose.connection;
    }
    const hash = crypto.createHash('md5').update(connectionURL).digest("hex");
    if (MGExistingList[hash]) {
        console.log('Returning an existing Mongo instance');
        if (MGExistingList[hash].readyState !== 1 || MGExistingList[hash].readyState !== 2) {
            MGExistingList[hash] = await createConnection();
        }
    } else {
        console.log('Creating a Mongo instance');
        try {
            MGExistingList[hash] = await createConnection();
        } catch (err) {
            console.log(err);
        }
    }
    return MGExistingList[hash];
}