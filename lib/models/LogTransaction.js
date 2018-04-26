'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  ePayRef: {
    type: String,
    required: true
  },
  sptrn: {
    type: String
  },
  initiateTransaction: Schema.Types.Mixed,
  UpdateTranStatusAUTHRECEIVED: Schema.Types.Mixed,
  UpdateTranStatusRECEIVED: Schema.Types.Mixed,
  UpdateTranStatusAcq: Schema.Types.Mixed,
  ProcessBatchByID: Schema.Types.Mixed,
  CreateSettlement: Schema.Types.Mixed,
  CreateCommission: Schema.Types.Mixed,
  CreateCommissionBatch: Schema.Types.Mixed,
  reconcileTransaction: Schema.Types.Mixed,
  CreateSettlementBatch : Schema.Types.Mixed
});

const LogTransaction = mongoose.model('LogTransaction', schema, 'LogTransaction');

module.exports = LogTransaction;
