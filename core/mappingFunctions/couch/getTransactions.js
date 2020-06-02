'use strict';

const transaction = require('../../lib/services/transaction');

function getTransactions(payload, UUIDKey, route, callback, JWToken) {
  payload.userID = JWToken._id;
  _getTransactions(payload, callback);
}

function _getTransactions(payload, callback) {
  transaction.getConsolidateView(payload)
    .then((transactions) => {
      const response = {};
      response[payload.action] = {
        action: payload.action,
        data: transactions
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.getTransactions = getTransactions;

