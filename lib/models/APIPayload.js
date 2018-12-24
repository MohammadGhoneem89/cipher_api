'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  uuid: {
    type: String
  },
  channel: {
    type: String
  },
  action: {
    type: String
  },
  payload: Schema.Types.Mixed,
  createdAt: {
    type: Number,
    default: dates.newDate
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  blockChain: Schema.Types.Mixed
});

const AuditLog = mongoose.model('APIPayload', schema, 'APIPayload');

module.exports = AuditLog;
