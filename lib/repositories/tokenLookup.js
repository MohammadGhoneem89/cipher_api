'use strict';

const models = require('../models');

const TokenLookup = models.TokenLookup;

module.exports = {
  findOne,
  removeAndCreate,
  update,
  remove
};

function removeAndCreate(payload) {
  return TokenLookup.remove({ userId: payload.userId })
    // .then(new TokenLookup(payload).save());
    .then(() => {
      new TokenLookup(payload).save();
    });
}

function findOne(query) {
  return TokenLookup.findOne(query);
}

function update(query, doc) {
  return TokenLookup
    .update(query, doc);
}

function remove(query) {
  return TokenLookup.remove(query);
}
