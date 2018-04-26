'use strict';

const common = require('./common');

const reqType = ['E', 'A', 'SDG', 'Commission', 'Settlement'];

const getBlockChain = {
  properties: {
    action: common.action,
    ePayRef: {
      required: false,
      type: 'string',
      messages: {
        required: 'ePayRef is missing',
        type: 'ePayRef must be of string type'
      }
    },
    spTrn: {
      required: false,
      type: 'string',
      messages: {
        required: 'spTrn is missing',
        type: 'spTrn must be of string type'
      }
    },
    reqType: {
      required: true,
      type: 'string',
      enum: reqType,
      messages: {
        required: 'reqType is missing',
        type: 'reqType must be of string type',
        enum: `only ${reqType} allowed`
      }
    }
  }
};

module.exports = {
  getBlockChain
};
