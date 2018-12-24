'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');
const msgConst = require('../constants/msg');
const commonConst = require('../constants/common');

const schema = new Schema({
  event: {
    type: String,
    required: msgConst.auditLog.event,
    enum: commonConst.auditLog.event
  },
  collectionName: {
    type: String,
    required: msgConst.auditLog.collectionName
  },
  ipAddress: {
    type: String
  },
  current: {
    type: Schema.Types.Mixed,
    required: msgConst.auditLog.current
  },
  previous: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Number,
    default: dates.newDate
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  }
});

const AuditLog = mongoose.model('AuditLog', schema, 'AuditLog');

module.exports = AuditLog;
