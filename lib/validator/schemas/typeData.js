'use strict';

const common = require('./common');

const userTypeCodeEnum = ['SDG', 'Settlement', 'Entity', 'Acquirer'];
const userSubtypes = {
  properties: {
    action: common.action,
    userTypeCode: {
      required: true,
      type: 'string',
      enum: userTypeCodeEnum,
      messages: {
        required: 'userTypeCode is missing',
        type: 'Please choose a valid User type',
        enum: 'Please choose a valid User type'
      }
    }
  }
};

module.exports = {
  userSubtypes
};
