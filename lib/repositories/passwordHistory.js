'use strict';

const models = require('../models');

const PasswordHistory = models.PasswordHistory;

module.exports = {
  findByUserId,
  create
};

function findByUserId(userId, limit = 2) {
  return PasswordHistory.find({ userId: userId }).sort({ createdAt: -1 }).limit(limit);
}

function create(data) {
  return new PasswordHistory(data).save();
}
