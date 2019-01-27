'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  eventName: {
    type: String,
    unique: true
  },
  dataSource: ['DataSource'],
  dipatcher: [{
    endpointName: {
      type: Schema.Types.ObjectId, ref: 'EndpointDefination'
    },
    templateName: {
      type: Schema.Types.ObjectId, ref: 'APITemplates'
    },
    dispatcherName: {
      type: String
    },
    dispatchFunction: {
      type: String
    },
    filePath: {
      type: String
    },
    groupName: {
      type: String
    },
    requestBody: {
      type: String
    },
    requestHeader: {
      type: String
    },
    requestURL: {
      type: String
    },
    requestURI: {
      type: String
    },
    templateId: {
      type: String
    },
    type: {
      type: String
    },
    actions: Schema.Types.Mixed
  }
  ],
  rule: [{
    sourceEvent: {
      type: String
    },
    field: {
      type: String
    },
    operator: {
      type: String
    },
    value: {
      type: String
    },
    type: {
      type: String
    }
  }],
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
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

const EventRegistry = mongoose.model('EventRegistry', schema, 'EventRegistry');

module.exports = EventRegistry;
