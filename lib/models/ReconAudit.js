'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  fileName: {
    type: String
  },
  status: {
    type: String,
    default: 'UPLOADED'
  },
  message: {
    type: String
  },
  filePath: {
    type: String
  },
  reqType: {
    type: String
  },
  shortCode: {
    type: String
  },
  orgDetails: {
    type: Schema.Types.Mixed
  },
  serviceCode: {
    type: String
  },
  processedBy: {
    type: String
  },
  processedOn: {
    type: String
  },
  reconType: {
    type: String
  },
  org: {
    type: String
  },
  IP: {
    type: String
  },
  createdAt: {
    type: Number,
    default: dates.newDate,
    index : true
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  createdID: {
    type: String
  },
  updatedAt: {
    type: Number,
    default: dates.newDate
  },
  updatedBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  validationSummary: Schema.Types.Mixed
});

const ReconAudit = mongoose.model('ReconAudit', schema, 'ReconAudit');

module.exports = ReconAudit;
