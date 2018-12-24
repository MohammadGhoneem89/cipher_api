'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  reportName: {
    type: String
  },
  documentName: {
    type: String
  },
  content: {
    exportTitle: {
      type: String
    },
    header: {
      type: String
    },
    footer: {
      type: String
    },
    body: {
      type: String
    },
    functionName: {
      type: String
    },
    headerHeight: {
      type: String
    },
    footerHeight: {
      type: String
    },
    orientation: {
      type: String
    }
  },
  projection: [String],
  filters: [{
    type: {
      type: String
    },
    label: {
      type: String
    },
    id: {
      type: String
    },
    typeData: {
      type: String
    },
    isMultiSelection: {
      type: String
    },
    couchValue: {
      type: String
    }
  }],
  createdAt: {
    type: Number,
    default: dates.newDate
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  updatedAt: {
    type: Number,
    default: dates.newDate
  },
  updatedBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  }
});

const ReportsCriteria = mongoose.model('ReportsCriteria', schema, 'ReportsCriteria');

module.exports = ReportsCriteria;
