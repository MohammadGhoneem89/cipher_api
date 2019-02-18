'use strict';

const updateLastRecon = {
  properties: {
    reqType: {
      required: true,
      type: 'string',
      enum: ['E', 'A'],
      messages: {
        required: 'reqType is missing',
        type: 'reqType must be of string type',
        enum: 'only E,A allowed'
      }
    },
    shortCode: {
      required: true,
      type: 'string',
      messages: {
        required: 'shortCode is missing',
        type: 'shortCode must be of string type'
      }
    }
  }
};

module.exports = {
  updateLastRecon
};
