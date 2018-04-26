'use strict';

const acquirerRepo = require('../repositories/acquirer');
const entityRepo = require('../repositories/entity');
const validator = require('../validator');
const selectWithView = require('../couch/selectWithView');
const _ = require('lodash');

module.exports = {
  updateLastRecon,
  lastSettlementDate,
  findAll
};

function updateLastRecon(payload) {
  return validator.errorValidate(payload, validator.schemas.entity.updateLastRecon)
    .then(() => {
      if (payload.reqType === 'A') {
        return acquirerRepo.findOne({ shortCode: payload.shortCode });
      }
      if (payload.reqType === 'E') {
        return entityRepo.findOne({ spCode: payload.shortCode });
      }
      return Promise.resolve();
    })
    .then((res) => {
      const days = +res.recon.noOfDays;
      const secs = 86400 * days;
      const lastReconDate = res.lastReconDate + secs;
      const updateObj = { lastReconDate: lastReconDate };
      if (payload.reqType === 'A') {
        return acquirerRepo.findOneAndUpdate({ shortCode: payload.shortCode }, updateObj);
      }
      if (payload.reqType === 'E') {
        return entityRepo.findOneAndUpdate({ spCode: payload.shortCode }, updateObj);
      }
      return Promise.resolve();
    })
    .then(() => {
      return { message: 'success' };
    });
}

function lastSettlementDate() {
  const viewUrl = '_design/lastSettlementDate/_view/lastSettlementDate';
  const channel = 'transactions';
  const option = { reduce: true, group_level: 1, group: true, limit: 50 }; // eslint-disable-line camelcase
  return Promise.all([
    entityRepo.find({}, 'spCode settlement', true),
    selectWithView(channel, viewUrl, option)
  ])
    .then((res) => {
      const entities = res[0];
      const dates = res[1];
      for (const entity of entities) {
        const date = _.find(dates, { key: entity.spCode });
        entity.lastSettlementDate = _.get(date, 'value', 0);
      }
      return entities;
    });
}

function findAll() {
  return entityRepo.find();
}
