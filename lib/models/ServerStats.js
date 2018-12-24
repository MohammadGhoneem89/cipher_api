'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  ip: {
    type: String,
    unique: true,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Number,
    default: dates.newDate
  }
});

const ServerStats = mongoose.model('ServerStats', schema, 'ServerStats');

module.exports = ServerStats;
