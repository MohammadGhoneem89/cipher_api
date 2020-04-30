'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  weekStartDay: {
    type: String,
    default: "Sunday"
  },
  weekEndDay: {
    type: String,
    default: "Thursday"
  },
  dayStart: {
    type: String,
    default: '08:00:00'
  },
  dayEnd: {
    type: String,
    default: '15:00:00'
  },
  calendarName: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  calendarMonth: {
    type: String
  },
  calendarYear: {
    type: String
  },
  workHours: [
    {
      type: String,
      default: '08:00:00'
    },
    {
      type: String,
      default: '15:00:00'
    }
  ],
  workinghours: {
    "0": {
      type: Array,
      default: null
    },
    "1": [{
      type: String,
      default: '08:00:00'
    }, {
      type: String,
      default: '15:00:00'
    }],
    "2": [{
      type: String,
      default: '08:00:00'
    }, {
      type: String,
      default: '15:00:00'
    }],
    "3": [{
      type: String,
      default: '08:00:00'
    }, {
      type: String,
      default: '15:00:00'
    }],
    "4": [{
      type: String,
      default: '08:00:00'
    }, {
      type: String,
      default: '15:00:00'
    }],
    "5": [{
      type: String,
      default: '08:00:00'
    }, {
      type: String,
      default: '15:00:00'
    }],
    "6": {
      type: Array,
      default: null
    }
  },
  holidays: [
    {
      type: String
    }
  ],
  exceptionList: [
    {
      title: {
        type: String
      },
      start: {
        type: String,
        default: dates.now
      },
      end: {
        type: String
      },
      actions:{
        type:Object
      },
      color: {
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