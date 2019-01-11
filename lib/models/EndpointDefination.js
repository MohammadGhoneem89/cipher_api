'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  address: {
    type: String
  },
  status: {
    type: Boolean
  },
  attachCert: {
    type: Boolean
  },
  certPhrase: {
    type: String
  },
  authType: {
    type: String
  },
  requestType: {
    type: String
  },
  protocol: Schema.Types.Mixed,
  auth: Schema.Types.Mixed,
  certificates: Schema.Types.Mixed
});

const EndpointDefination = mongoose.model('EndpointDefination', schema, 'EndpointDefination');

module.exports = EndpointDefination;
