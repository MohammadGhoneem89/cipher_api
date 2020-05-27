'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  address: {
    type: String
  },
  apiSecret: {
    type: String
  },
  gatewayUrl:{
    type: String
  },
  groupId:{
    type: String
  },
  gatewayHost:{
    type: String
  },
  apiKey:{
    type: String
  },
  name: {
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
  header: Schema.Types.Mixed,
  protocol: Schema.Types.Mixed,
  auth: {
    username: {
      type: String
    },
    password: {
      type: String
    },
    field: {
      type: String
    },
    endpoint: {
      type: Schema.Types.ObjectId, ref: 'EndpointDefination'
    }
  },
  certificates: Schema.Types.Mixed
});

const EndpointDefination = mongoose.model('EndpointDefination', schema, 'EndpointDefination');

module.exports = EndpointDefination;
