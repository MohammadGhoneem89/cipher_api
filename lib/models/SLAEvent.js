'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  processName: {
    type: String
  },
  currentState: {
    type: String
  },
  nextState: {
    type: String
  },
  refNum: {
    type: String
  },
  SLABurstTime: {
    type: Number,
    default: dates.newDate
  },
  createdAt: {
    type: Number,
    default: dates.newDate
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  isProcessed: {
    type: Boolean
  },
  nextExecution: {
    type: Number,
    default: dates.newDate()
  },
  SLABreached: {
    type: Boolean
  }
});

const SLAEvent = mongoose.model('SLAEvent', schema, 'SLAEvent');

module.exports = SLAEvent;
