'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  templateId: {
    type: Schema.Types.ObjectId, ref: 'APITemplates',
    unique: true
  },
  templateDetails: [{
    attributeName: {
      type: String
    },
    attributeDefaultValue: {
      type: String
    },
    displayName: {
      type: String
    }
  }]
});

const ConfigMaker = mongoose.model('ConfigMaker', schema, 'ConfigMaker');

module.exports = ConfigMaker;
