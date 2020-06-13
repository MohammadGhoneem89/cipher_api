'use strict';
const factory = require('../client/index');
const crypto = require('../../../lib/helpers/crypto');
const config = require('../../../config/index');

module.exports.connection = function () {
  let dbConfig = 'postgresql://Admin:avanza123@104.211.155.19:5432/kashif?idleTimeoutMillis=300000000' //crypto.decrypt(config.get('postgres.url'));
  //console.log("-------------------------------postgres.url",config.get('postgres.url'))
  return new Promise(async (resolve, reject) => {
    try {
      let pgConnection = await factory.createClient('pg', dbConfig);
      return resolve(pgConnection);
    }
    catch (e) {
      return reject(e);
    }
  });
};
