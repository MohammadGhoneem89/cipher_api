'use strict';

const validator = require('../validator');
const logTransRepo = require('../repositories/logTransaction');
const apiPayloadRepo = require('../repositories/apiPayload');
const _ = require('lodash');

module.exports = {
  upsert,
  getBlockChainId
};

function upsert(payload) {
  return Promise.all([
    logTransRepo.upsert(payload),
    apiPayloadRepo.update({ uuid: _.get(payload, 'data.uuid', '') }, { $set: { blockChain: _.get(payload, 'data.blockChain', {}) } })
  ])
    .then(() => {
      return { success: true };
    });
}

function getBlockChainId(payload) {
  return validator.errorValidate(payload, validator.schemas.logTransaction.getBlockChain)
    .then(() => {
      if (!payload.ePayRef && !payload.spTrn) {
        const error = { message: 'Either ePayRef or spTrn is required' };
        throw error;
      }
      let query = {};
      if (payload.ePayRef) {
        query = { ePayRef: payload.ePayRef };
      }
      if (payload.spTrn) {
        query = { sptrn: payload.spTrn };
      }
      return logTransRepo.findOne(query);
    })
    .then((tran) => {
      let blockChainId = {};
      switch (payload.reqType) {
        case 'A':
          return _.get(tran, 'UpdateTranStatusAcq', {});
        case 'E':
          blockChainId = _.get(tran, 'reconcileTransaction') ? _.get(tran, 'reconcileTransaction') : _.get(tran, 'initiateTransaction', {});
          return blockChainId;
        case 'SDG':
          blockChainId = _.get(tran, 'UpdateTranStatusAUTHRECEIVED') ? _.get(tran, 'UpdateTranStatusAUTHRECEIVED') : _.get(tran, 'UpdateTranStatusRECEIVED', {});
          return blockChainId;
        case 'Settlement':
          blockChainId = _.get(tran, 'CreateSettlement') ? _.get(tran, 'CreateSettlement') : _.get(tran, 'CreateSettlementBatch', {});
          return blockChainId;
        case 'Commission':
          blockChainId = _.get(tran, 'CreateCommission') ? _.get(tran, 'CreateCommission') : _.get(tran, 'CreateCommissionBatch', {});
          return blockChainId;
        default:
          return blockChainId;
      }
    });
}
