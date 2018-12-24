'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  userID: {
    type: String,
    required: true
  },
  isValid: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Number,
    default: dates.newDate
  }
});

const LogTransaction = mongoose.model('LoginAttempt', schema, 'LoginAttempt');

module.exports = LogTransaction;
