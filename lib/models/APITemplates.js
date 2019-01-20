'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: {
    type: String,
    unique: true
  },
  data: {
    type: Object
  }
});

const apiTemplates = mongoose.model('APITemplates', schema, 'APITemplates');

module.exports = apiTemplates;
