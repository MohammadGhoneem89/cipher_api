'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reportType: {
    type: String,
    required: true
  },
  queryCount: {
    type: Number
  },
  queryStrValues: [{
    type: String
  }],
  queryStrLabel: {
    type: String
  },
  connectionType: {
    type: String,
    required: true
  },
  scheduleTime: {
    type: String
  },
  scheduleTimeDisplay: {
    type: String
  },
  email: {
    type: String
  },
  isScheduled: {
    type: Boolean
  },
  connectionString: {
    type: Schema.Types.ObjectId, ref: 'EndpointDefination'
  },
  group: [{
    type: Schema.Types.ObjectId, ref: 'Group'
  }],
  queryStr: {
    type: String,
    required: true
  },
  filters: [{
    type: Schema.Types.Mixed,
    required: true
  }],
  createdAt: {
    type: Number,
    default: dates.newDate,
    index: true
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
  }
});

const ADHReport = mongoose.model('ADHReport', schema, 'ADHReport');

module.exports = ADHReport;
