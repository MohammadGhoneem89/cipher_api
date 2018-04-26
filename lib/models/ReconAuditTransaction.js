'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  reconAuditId: {
    type: Schema.Types.ObjectId, ref: 'ReconAudit', index: true
  },
  transaction: {
    paymentMethod: {
      type: String
    },
    SPTRN: {
      type: String
    },
    PGRefNo: {
      type: String, index: true
    },
    serviceCode: {
      type: String
    },
    ePayNo: {
      type: String
    },
    shortCode: {
      type: String
    },
    status: {
      type: String
    },
    amount: {
      type: String
    },
    transDate: {
      type: Number,
      default: dates.newDate
    },
    BLADescription: {
      type: String
    },
    BLA_status: {
      type: String
    },
    SPCode: {
      type: String
    },
    PGNo: {
      type: String
    },
    FPS_status: {
      type: String
    },
    BLA_messageID: {
      type: String
    },
    FPS_batchID: {
      type: String
    },
    FPS_errors: [Schema.Types.Mixed]
  },
  createdAt: {
    type: Number,
    default: dates.newDate
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  updatedAt: {
    type: Number,
    default: dates.newDate
  },
  updatedBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  }
});
schema.index({ reconAuditId: 1, PGRefNo: 1 });

const AuditLog = mongoose.model('ReconAuditTransaction', schema, 'ReconAuditTransaction');

module.exports = AuditLog;
