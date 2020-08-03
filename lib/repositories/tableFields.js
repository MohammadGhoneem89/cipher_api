'use strict';

const models = require('../models');

const TableFields = models.TableFields;

module.exports = {
  find
};

function find(query) {
  return TableFields
    .find(query);
}
