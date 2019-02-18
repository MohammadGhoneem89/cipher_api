'use strict';

const models = require('../models');
const _ = require('lodash');

const LoginAttempts = models.LoginAttempts;

module.exports = {
  create,
  lastLoginIn
};

function create(payload) {
  return new LoginAttempts(payload).save();
}

function lastLoginIn(userId) {
  const query = { userId: userId, isValid: true };
  return LoginAttempts.find(query)
    .sort({ createdAt: -1 })
    .then((res) => _.get(res, '[1].createdAt', null));
}
