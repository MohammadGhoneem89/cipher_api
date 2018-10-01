'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
dataSourceName: {
    type: String,
    unique:true
  },
  sourceFunction: {
    type: String
  },
  filePath: {
    type: String
  },
  createdAt: {
    type: Number,
    default: dates.newDate,
    index : true
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
  },
  sourceDataDefination: [{
      eventName: {
        type: String
      },
      dataJsonStructure: {
        type: Schema.Types.Mixed
      }
  }]
});

const DataSource = mongoose.model('DataSource', schema, 'DataSource');

module.exports = DataSource;
