'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  ruleList: [{
    ruleName: {
      type: String,
      required: true
    },
    field: {
      type: String,
      required: true
    },
    option: {
      type: String
    },
    value: {
      type: String
    },
    emailTemplate: {
      type: Schema.Types.ObjectId, ref: 'EmailTemplate'
    },
    group: {
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
  }
});

const HealthNotifications = mongoose.model('HealthNotifications', schema, 'HealthNotifications');

module.exports = HealthNotifications;
