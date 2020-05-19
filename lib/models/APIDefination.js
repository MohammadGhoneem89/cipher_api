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
  ServiceURL: {
    type: String
  },
  endpointName: {
    type: Schema.Types.ObjectId, ref: 'EndpointDefination'
  },
  sampleRequest: {
    type: Schema.Types.Mixed
  },
  ServiceHeader: {
    type: Schema.Types.Mixed
  },
  rules: [{
    "BlockRuleName": {
      type: String
    },
    "channel": {
      type: Schema.Types.ObjectId, ref: 'Channel'
    },
    "consortium": {
      type: Schema.Types.ObjectId, ref: 'ConsortiumConfig'
    },
    "smartcontract": {
      type: String
    },
    "smartcontractid": {
      type: Schema.Types.ObjectId, ref: 'SmartContract'
    },
    "ruleList": {
      type: Schema.Types.Mixed
    },
    "channelText": {
      type: String
    },
    "smartcontractFunc": {
      type: String
    },
    "type": {
      type: String
    },
    "consortiumText": {
      type: String
    },
    "displayText": {
      type: String
    },
    "actions": {
      type: Schema.Types.Mixed
    }
  }],
  description: {
    type: String
  },
  authorization: {
    type: String
  }, currency: {
    type: String
  }, cycle: {
    type: String
  },
  billingDate: {
    type: Number
  }, isBilled: {
    type: Boolean,
    default: false
  },
  isBlockchain: {
    type: Boolean,
    default: false
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
  }, isResValBypass: {
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
  BillingPolicy: {
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
  },
  isHMAC: {
    type: Boolean,
    default: false
  },
  isRelay: {
    type: Boolean,
    default: false
  },
  RelayNet: {
    type: String
  },
  RemoteAPI: {
    type: String,
    default: false
  }
});
schema.index({useCase: 1, route: 1}, {unique: true});
const APIDefination = mongoose.model('APIDefination', schema, 'APIDefination');

module.exports = APIDefination;
