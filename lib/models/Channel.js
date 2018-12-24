'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  networkName: {
    type: String,
    required: true
  },
  channelName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  orgList: [{
    type: String,
    required: true
  }],
  network: {
    type: Schema.Types.ObjectId, ref: 'NetworkConfiguration'
  },
  documents: {
    type: Schema.Types.Mixed,
    required: true
  },
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
const Channel = mongoose.model('Channel', schema, 'Channel');

module.exports = Channel;
