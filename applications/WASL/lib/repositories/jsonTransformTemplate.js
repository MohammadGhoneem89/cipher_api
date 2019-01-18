'use strict';

const models = require('../models');

const JSONTransformTemplates = models.JSONTransformTemplates;

module.exports = {
  findOne
};

function findOne(query) {
  return JSONTransformTemplates
    .findOne(query);
}