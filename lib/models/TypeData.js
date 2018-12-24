'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  typeName: {
    type: String
  },
  data: Schema.Types.Mixed
});

const typeData = mongoose.model('TypeData', schema, 'TypeData');

module.exports = typeData;
