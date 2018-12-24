'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  dispatcherName: {
    type: String,
    unique: true
  },
  dispatchFunction: {
    type: String
  },
  filePath: {
    type: String
  },
  type: {
    type: String
  },
  requestURL: {
    type: String
  },
  requestBody: {
    type: Schema.Types.Mixed
  },
  requestHeader: {
    type: Schema.Types.Mixed
  },
  groupName: {
    type: String
  },
  templateId: {
    type: Schema.Types.ObjectId, ref: 'EmailTemplate'
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

const EventDispatcher = mongoose.model('EventDispatcher', schema, 'EventDispatcher');

module.exports = EventDispatcher;
