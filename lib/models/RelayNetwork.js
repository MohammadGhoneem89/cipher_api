'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  networkName: {
    type: String,
    required: true
  },
  orginizationAlias: {
    type: String,
    required: true
  },
  orgList: [{
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

const RelayNetwork = mongoose.model('RelayNetwork', schema, 'RelayNetwork');

module.exports = RelayNetwork;
