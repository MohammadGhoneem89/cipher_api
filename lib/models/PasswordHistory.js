'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  password: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  createdAt: {
    type: Number,
    default: dates.newDate
  }
});

const PasswordPolicy = mongoose.model('PasswordHistory', schema, 'PasswordHistory');

module.exports = PasswordPolicy;
