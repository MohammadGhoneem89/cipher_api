'use strict';

const mongoose = require('mongoose');
const crypto = require('../../../lib/helpers/crypto');

module.exports.connection = function(dbConfig) {
  dbConfig = crypto.decrypt(dbConfig);
  return new Promise(function(resolve, reject) {
    mongoose.Promise = Promise;
    mongoose.connect(dbConfig, { useMongoClient: true });

    const connection = mongoose.connection;
    connection.on('error', function(err) {
      console.log(err);
      return reject(err);
    });

    connection.once('open', function dbConnected() {
      return resolve(connection);
    });
  });
};
