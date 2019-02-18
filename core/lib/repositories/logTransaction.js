'use strict';

const models = require('../models');
const LogTransaction = models.LogTransaction;
const _ = require('lodash');

module.exports = {
  upsert,
  findOne
};

function upsert(payload) {
  const query = { ePayRef: _.get(payload, 'data.ePayRef') };
  payload = payload || {};
  payload.data = payload.data || {};

  if (payload.data.initiateTransaction) {
    return new LogTransaction(payload.data).save();
  }

  return LogTransaction.findOne(query)
    .then((log) => {
      if (log) {
        return LogTransaction.update(query, payload.data);
      }
      return new LogTransaction(payload.data).save();
    });
}

function findOne(query) {
  return LogTransaction.findOne(query);
}
