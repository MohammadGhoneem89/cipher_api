'use strict';

const models = require('../models');

const TokenLookup = models.TokenLookup;

module.exports = {
  findOne,
  removeAndCreate
};

function removeAndCreate(payload) {
  return TokenLookup.remove({ userId: payload.userId })
    .then(new TokenLookup(payload).save());
}

function findOne(query) {
  return TokenLookup.findOne(query);
}
