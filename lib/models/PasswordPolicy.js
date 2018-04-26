'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  minimumPasswordLength: {
    type: Number,
    required: true
  },
  maximumPasswordLength: {
    type: Number,
    required: true
  },
  minimumAlphabetCount: {
    type: Number,
    required: true
  },
  maximumAlphabetCount: {
    type: Number,
    required: true
  },
  minimumDigitCount: {
    type: Number,
    required: true
  },
  maximumDigitCount: {
    type: Number,
    required: true
  },
  allowIncorrectLoginAttempts: {
    type: Number,
    required: true
  },
  minimumUpperCase: {
    type: Number,
    required: true
  },
  minimumLowerCase: {
    type: Number,
    required: true
  },
  errorMessage: {
    type: String,
    required: true
  },
  lockTimeInMinutes: {
    type: Number,
    required: true
  },
  unAcceptedKeywords: [String],
  changePeriodDays: {
    type: Number,
    required: true
  }
});

const PasswordPolicy = mongoose.model('PasswordPolicy', schema, 'PasswordPolicy');

module.exports = PasswordPolicy;
