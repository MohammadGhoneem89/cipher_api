'use strict';

const models = require('../models');

const PasswordPolicy = models.PasswordPolicy;

module.exports = {
  findOne
};

function findOne() {
  return PasswordPolicy.findOne();
}
