'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  path: {
    type: String
  },
  ext: {
    type: String
  },
  name: {
    type: String
  },
  type: {
    type: String
  },
  userId: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  source: {
    type: String
  },
  context: {
    type: String
  },
  contentType: {
    type: String
  },
  hash: {
    type: String
  },
  UUID: {
    type: String
  },
  fileReference: {
    type: String
  }
});

const Documents = mongoose.model('Documents', schema, 'Documents');

module.exports = Documents;

