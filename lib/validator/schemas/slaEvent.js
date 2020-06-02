'use strict';

const common = require('./common');

const create = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        processName: {
          required: true,
          type: 'string',
          messages: {
            required: 'processName is missing',
            type: 'processName must be of string type'
          }
        },
        currentState: {
          type: 'string',
          required: false,
          messages: {
            required: 'currentState is missing',
            type: 'currentState must be of string type'
          }
        },
        nextState: {
          type: 'string',
          required: false,
          messages: {
            required: 'nextState is missing',
            type: 'nextState must be of string type'
          }
        },
        refNum: {
          type: 'string',
          required: false,
          messages: {
            required: 'refNum is missing',
            type: 'refNum must be of string type'
          }
        },
        SLABurstTime: {
          type: 'number',
          required: false,
          messages: {
            required: 'SLABurstTime is missing',
            type: 'SLABurstTime must be of number type'
          }
        },
        isProcessed: {
          type: 'boolean',
          required: false,
          messages: {
            required: 'isProcessed is missing',
            type: 'isProcessed must be of boolean type'
          }
        },
        nextExecution: {
          type: 'number',
          required: false,
          messages: {
            required: 'nextExecution is missing',
            type: 'nextExecution must be of number type'
          }
        },
        SLABreached: {
          type: 'boolean',
          required: false,
          messages: {
            required: 'SLABreached is missing',
            type: 'SLABreached must be of boolean type'
          }
        }
      },
      messages: {
        required: 'data is missing',
        type: 'data must be of object type'
      }
    }
  }
};

module.exports = {
  create
};
