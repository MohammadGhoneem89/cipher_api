'use strict';

const models = require('../models');

const ReconAuditTransaction = models.ReconAuditTransaction;

module.exports = {
  create,
  find,
  update
};

function create(payload) {
  return new ReconAuditTransaction(payload).save();
}

function find(query) {
  return ReconAuditTransaction.find(query);
}

function update(query, set) {
  return ReconAuditTransaction.update(query, set, { multi: true });
}
