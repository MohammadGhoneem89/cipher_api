'use strict';

const models = require('../models');

const ReportsCriteria = models.ReportsCriteria;

module.exports = {
  find,
  findOne
};

function find(query) {
  return ReportsCriteria.find(query);
}

function findOne(id) {
  return ReportsCriteria.findOne({ _id: id }).lean(true);
}
