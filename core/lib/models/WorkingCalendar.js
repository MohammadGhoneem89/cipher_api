'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  calendarName: {
    type: String
  },
  isActive: {
    type: String
  },
  calendarYear: {
    type: String
  },
  weekStartDay: {
    type: String
  },
  weekEndDay: {
    type: String
  },
  exceptions: [
    {
      name: {
        type: String
      },
      description: {
        type: String
      },
      date: {
        type: String,
        default: dates.now
      },
      isHoliday: {
        type: String
      }
    }
  ],
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

const workingCalendar = mongoose.model('WorkingCalendar', schema, 'WorkingCalendar');

module.exports = workingCalendar;
