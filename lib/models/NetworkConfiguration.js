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
  ca: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  secret: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  mspid: {
    type: String,
    required: true
  },
  orderer: {
    url: {
      type: String,
      required: true
    }, serverHostname: {
      type: String,
      required: true
    }, tlsCacerts: {
      type: String,
      required: true
    }
  },
  peerList: [{
    type: Schema.Types.Mixed,
    required: true
  }],
  peerUser: {
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

const NetworkConfiguration = mongoose.model('NetworkConfiguration', schema, 'NetworkConfiguration');

module.exports = NetworkConfiguration;
