'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: {
    type: String,
    index: true
  },
  type: {
    type: String
  },
  adaptor: {
    type: String,
    index: true
  },
  fields: [],
  outputs: []
});

const tableFields = mongoose.model('TableFields', schema, 'TableFields');

module.exports = tableFields;
