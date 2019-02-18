'use strict';

const Config = require('../models/Config');

module.exports = {
  findOneByName,
  findOneAndUpdate
};

function findOneByName(name) {
  return Config.findOne({ name: name }).lean(true);
}

function findOneAndUpdate(query, payload, options) {
  return Config.findOneAndUpdate(query, payload, options);
}

