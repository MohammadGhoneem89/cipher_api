'use strict';

const models = require('../models');

const SLAEvent = models.SLAEvent;

module.exports = {
  create,
  find,
  findOneAndUpdate
};

function create(data) {
  return new SLAEvent(data).save();
}

function find(query) {
  return SLAEvent.find(query);
}

function findOneAndUpdate(query, payload) {
  return SLAEvent
    .findOneAndUpdate(query, payload);
}
