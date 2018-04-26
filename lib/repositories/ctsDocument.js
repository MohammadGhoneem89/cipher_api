'use strict';

const models = require('../models');

const CTSDocument = models.CTSDocument;

module.exports = {
  create
};

function create(data) {
  return new CTSDocument(data).save();
}
