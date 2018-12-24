'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: {
    type: String
  },
  data: Schema.Types.Mixed
});

const config = mongoose.model('Config', schema, 'Config');

module.exports = config;
