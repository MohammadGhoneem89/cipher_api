'use strict';

const common = require('../../../../../lib/validator/schemas/common');

const update = {
  properties: {
    action: common.action,
    data:{
      type: 'object',
      required: true,
      messages: {
        required: 'data Object is missing',
        type: 'Request Structure is not correct'
      },
      properties:{
        accountName: {
          type: 'string',
          required: true,
          messages: {
            required: 'accountName is missing',
            type: 'accountName must be of string type'
          }
        },
        amount: {
          type: 'string',
          required: true,
          messages: {
            required: 'amount is missing',
            type: 'amount must be of string type'
          }
        }
      }
    }
  }
};

module.exports = {
  update
};
