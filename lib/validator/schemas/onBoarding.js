'use strict';

const createDB = {
  properties: {
    orgType: {
      required: true,
      type: 'string',
      enum: ['entity', 'acquirer'],
      messages: {
        required: 'orgType is missing',
        type: 'orgType must be of string type',
        enum: 'only entity, acquirer allowed'
      }
    },
    shortCode: {
      required: true,
      type: 'string',
      messages: {
        required: 'shortCode is missing',
        type: 'shortCode must be of string type'
      }
    },
    onBoardDB: {
      required: true,
      type: 'string',
      messages: {
        required: 'onBoardDB is missing',
        type: 'onBoardDB must be of string type'
      }
    },
    onBoardURL: {
      required: false,
      type: 'string',
      messages: {
        required: 'onBoardURL is missing',
        type: 'onBoardURL must be of string type'
      }
    }
  }
};

module.exports = {
  createDB
};
