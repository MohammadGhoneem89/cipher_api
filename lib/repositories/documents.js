'use strict';

const models = require('../models');

const Documents = models.Documents;

module.exports = {
  findOne,
  create,
  findDocument: findOne
};

function findOne(query) {
  return Documents.findOne(query).lean(true).exec();
}

function create (payload) {
  return Documents.create(payload);
}
