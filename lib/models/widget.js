'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  widgetId: {
    type: String,
    require: true
  },
  widgetName: {
    type: String,
    require: true
  },
  widgetCaption: {
    type: String,
    require: false
  },
  widgetType: {
    type: String,
    require: false
  },
  status: {
    type: String,
    require: true
  }
});

const Widgets = mongoose.model('Widgets', schema, 'Widgets');

module.exports = Widgets;
