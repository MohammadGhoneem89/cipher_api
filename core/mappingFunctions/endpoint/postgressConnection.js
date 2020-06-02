'use strict';
const factory = require('../../../../core/api/client/index');

module.exports.connection = function (connectionString) {
  return new Promise(async (resolve, reject) => {
    try {
      let pgConnection = await factory.createClient('pg', connectionString);
      return resolve(pgConnection);
    }
    catch (e) {
      return reject(e);
    }
  });
};
