'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  ConsortiumName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  participants: [{
    type: Schema.Types.Mixed
  }],
  selectedUseCaseList: {
    type: Schema.Types.Mixed
  },
  selectedChannelList: [{
    type: Schema.Types.ObjectId, ref: 'Channel'
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
const ConsortiumConfig = mongoose.model('ConsortiumConfig', schema, 'ConsortiumConfig');

module.exports = ConsortiumConfig;
