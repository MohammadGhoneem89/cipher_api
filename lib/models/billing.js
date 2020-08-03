'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  action: {
    type: String
  },
  username: {
    type: String
  },
  hits: {
    type: Number
  },
  orgCode: {
    type: String
  },
  date: {
    type: Number
  }
});
schema.index({action: 1, username: 2, orgCode: 3, date: 4}, {unique: true});
const billing = mongoose.model('Billing', schema, 'Billing');

module.exports = billing;
