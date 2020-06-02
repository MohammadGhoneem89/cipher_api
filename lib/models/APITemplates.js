'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: {
    type: String,
    unique: true
  },
  type: {
    type: String
  },
  data: {
    type: Object
  },
  url: {
    type: String
  },
  form: {
    type: Object
  },
  customFunction: Schema.Types.Mixed
});

const apiTemplates = mongoose.model('APITemplates', schema, 'APITemplates');

module.exports = apiTemplates;
