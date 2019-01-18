'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  TemplateId: {
    type: String
  },
  JSONTemplate: Schema.Types.Mixed
});

const JSONTransformTemplates = mongoose.model('JSONTransformTemplates', schema, 'JSONTransformTemplates');

module.exports = JSONTransformTemplates;
