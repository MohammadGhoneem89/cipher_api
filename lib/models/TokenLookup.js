'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  token: {
    type: String
  },
  userId: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  createdAt: {
    type: Number,
    default: dates.newDate
  }
});

const typeData = mongoose.model('TokenLookup', schema, 'TokenLookup');

module.exports = typeData;
