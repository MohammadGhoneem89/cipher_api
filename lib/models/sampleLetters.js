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
    require: true
  },
  templatePayload: {
    type: String,
    require: true
  },
  templateType: {
    type: String,
    require: true
  },
  templatePath: {
    type: String,
    require: true
  }
});

const SampleLetters = mongoose.model('SampleLetter', schema, 'SampleLetter');

module.exports = SampleLetters;
