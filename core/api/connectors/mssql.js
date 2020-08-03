'use strict';
const factory = require('../client/index');
const crypto = require('../../../lib/helpers/crypto');
const config = require('../../../config/index');

module.exports.connection = async function (poolname = 'default') {

    let dbConfig = crypto.decrypt(config.get('mssqlConfig'));
    return new Promise(async (resolve, reject) => {
        try {

            let sqlconnection = await factory.createClient('mssql', dbConfig, poolname);
            console.log('sqlconnection', dbConfig);
            return resolve(sqlconnection);
        }
        catch (e) {
            console.log(e)
            return reject(e);
        }
    });
};