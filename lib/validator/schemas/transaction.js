'use strict';

const common = require('./common');

const getMonthYear = {
  properties: {
    action: common.action,
    searchCriteria: {
      type: 'object',
      required: true,
      properties: {
        fromDate: common.fromDateReq,
        toDate: common.toDateReq,
        value: {
          required: true,
          type: 'array',
          messages: {
            required: 'value is missing',
            type: 'value must be of array type'
          }
        },
        label: {
          required: true,
          type: 'string',
          enum: ['entity', 'acquirer', 'payment'],
          messages: {
            required: 'label is missing',
            type: 'label must be of array type',
            enum: 'only entity,acquirer,payment allowed'
          }
        },
        type: {
          required: true,
          type: 'string',
          enum: ['Year', 'Month'],
          messages: {
            required: 'type is missing',
            type: 'type must be of string type',
            enum: 'only Year,Month allowed'
          }
        }
      },
      messages: {
        required: 'searchCriteria is missing',
        type: 'searchCriteria must be of object type'
      }
    }
  }
};

module.exports = {
  getMonthYear
};
