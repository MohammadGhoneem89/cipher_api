'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  type: {
    type: String,
    required: true
  },
  smartContract: {
    type: String,
    required: true
  },
  smartContractVersion: {
    type: String,
    required: true
  },
  sequence: {
    type: String,
    required: true
  },
  packageIdentifier: {
    type: String,
    required: true
  },
  smartContractMethod: {
    type: String,
    required: true
  },
  smartContractAddress: {
    type: String,
    required: true
  },
  smartContractArgs: {
    type: Schema.Types.Mixed,
    required: true
  },
  abi: {
    type: Schema.Types.Mixed,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  contractAddress: {
    type: String,
    required: true
  },
  endorsementPolicy: {
    type: Schema.Types.Mixed
  },
  privateFor: {
    type: Schema.Types.Mixed
  },
  channelName: {
    type: String,
    required: true
  },
  channelID: {
    type: Schema.Types.ObjectId, ref: 'Channel'
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
const SmartContract = mongoose.model('SmartContract', schema, 'SmartContract');

module.exports = SmartContract;
