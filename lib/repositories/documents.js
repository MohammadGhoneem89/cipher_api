'use strict';

const models = require('../models');

const Documents = models.Documents;

module.exports = {
  findOne,
  create
};

function findOne(query) {
  return Documents.findOne(query);
}

function create (payload) {
  return Documents.create(payload);
}
