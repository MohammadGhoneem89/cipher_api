'use strict';

const models = require('../models');

const Document = models.Document;

module.exports = {
  create,
  insertMany
};

function create(data) {
  return new Document(data).save();
}

function insertMany(documents) {
  return Document.insertMany(documents);
}
