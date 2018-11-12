'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');
const schema = new Schema({
  route: {
    type: String
  },
  useCase: {
    type: String
  },
  documentPath: {
    type: String
  },
  fieldName: {
    type: String
  },
  MappingfunctionName: {
    type: String
  },
  CustomMappingFile: {
    type: String
  }, communicationMode: {
    type: String
  },
  requestServiceQueue: {
    type: String
  },
  responseQueue: {
    type: String
  },
  ServiceIP: {
    type: String
  },
  ServicePort: {
    type: String
  },
  description: {
    type: String
  },
  authorization: {
    type: String
  },
  isSimulated: {
    type: Boolean,
    default: false
  },
  isRouteOveride: {
    type: Boolean,
    default: false
  },
  isCustomMapping: {
    type: Boolean,
    default: false
  },
  isValBypass: {
    type: Boolean,
    default: false
  },
  isAsync: {
    type: Boolean,
    default: false
  },
  simulatorResponse: {
    type: Schema.Types.Mixed
  },
  simucases: {
    type: Schema.Types.Mixed
  },
  RequestMapping: {
    type: Schema.Types.ObjectId, ref: 'MappingConfig'
  },
  ResponseMapping: {
    type: Schema.Types.ObjectId, ref: 'MappingConfig'
  },
  createdAt: {
    type: Number,
    default: dates.newDate,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  createdID: {
    type: String
  },
  updatedAt: {
    type: Number,
    default: dates.newDate
  },
  updatedBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: false
  }
});
schema.index({ useCase: 1, route: 1 }, { unique: true });
const APIDefination = mongoose.model('APIDefination', schema, 'APIDefination');

module.exports = APIDefination;
