'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  templateId: {
    type: String,
    require: true
  },
  templateName: {
    type: String,
    require: true
  },
  templateMarkup: {
    type: String,
    require: false
  },
  templatePath: {
    type: String,
    require: false
  },
  templateType: {
    type: String,
    require: true
  },
  sampleJson: {
    type: String,
    require: true
  }
});

const Letters = mongoose.model('Letter', schema, 'Letter');

module.exports = Letters;
