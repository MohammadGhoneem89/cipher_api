'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  text: {
    type: String
  },
  type: {
    type: String
  },
  data: {
    type: String
  },
  handler:{
    type: String
  },
  action: {
    type: String
  },
  params: {
    type: String
  },
  createdBy: {
    type: String
  },
  updatedBy: {
    type: String
  },
  createdAt: {
    type: Number,
    default: dates.newDate
  },
  updatedAt: {
    type: Number,
    default: dates.newDate
  },
  isRead: {
    type: Boolean,
    default: false
  },
  labelClass: {
    type: String
  },
  userId: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  userID: {
    type: Schema.Types.ObjectId, ref: 'User'
  }
});

const Notifications = mongoose.model('Notifications', schema, 'Notifications');

module.exports = Notifications;