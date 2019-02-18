'use strict';
const factory = require('../client/index');
const crypto = require('../../../lib/helpers/crypto');

module.exports.connection = function(dbConfig) {
  dbConfig = crypto.decrypt(dbConfig);
  return new Promise(async (resolve, reject) => {
    try{
      let mongoConnection = await factory.createClient('mongo', dbConfig);
      return resolve(mongoConnection);
    }
    catch (e) {
      return reject(e);
    }
  });
};
