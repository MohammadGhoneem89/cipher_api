'use strict';

const _ = require('lodash');
const typeDataRepo = require('../repositories/typeData');

module.exports = {
  find
};

function find(payload) {
  return typeDataRepo.findTypeData(payload);
}
