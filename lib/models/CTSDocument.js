'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  transactionId: {
    type: String
  },
  CTSReferenceNumber: {
    type: String
  },
  status: {
    type: String
  },
  signedPDF: {
    type: Schema.Types.ObjectId, ref: 'Document'
  },
  attachments: [{
    type: Schema.Types.ObjectId, ref: 'Document'
  }]
});

const documents = mongoose.model('CTSDocument', schema, 'CTSDocument');

module.exports = documents;

