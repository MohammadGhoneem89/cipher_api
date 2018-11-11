'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  mappingName: {
    type: String,
    unique: true
  },
  mappingType: {
    type: String,
    unique: false
  },
  description: {
    type: String
  },
  fields: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Number,
    default: dates.newDate,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  createdID: {
    type: String
  },
  updatedAt: {
    type: Number,
    default: dates.newDate
  },
  updatedBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  }
});

const MappingConfig = mongoose.model('MappingConfig', schema, 'MappingConfig');

module.exports = MappingConfig;
