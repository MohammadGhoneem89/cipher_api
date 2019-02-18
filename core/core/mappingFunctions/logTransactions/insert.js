'use strict';

const logTransaction = require('../../../lib/services/logTransaction');

function logTransactionsInsert(payload, UUIDKey, route, callback, JWToken) {
  payload.userID = JWToken._id;
  upsert(payload, callback);
}

function upsert(payload, callback) {
  logTransaction.upsert(payload)
    .then((logs) => {
      const response = {
        logTransaction: {
          action: payload.action,
          data: logs
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.logTransactionsInsert = logTransactionsInsert;

