'use strict';

const common = require('./common');

const acquirer = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        acquirerId: {
          required: true,
          type: 'string',
          messages: {
            required: 'acquirerId is missing',
            type: 'acquirerId must be of array type'
          }
        },
        ePayRefNumber: {
          required: true,
          type: 'string',
          messages: {
            required: 'ePayRefNumber is missing',
            type: 'ePayRefNumber must be of array type'
          }
        },
        authorizedAmount: {
          required: true,
          type: 'string',
          messages: {
            required: 'authorizedAmount is missing',
            type: 'authorizedAmount must be of array type'
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

const entity = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        spCode: {
          required: true,
          type: 'string',
          messages: {
            required: 'spCode is missing',
            type: 'spCode must be of string type'
          }
        },
        serviceCode: {
          required: true,
          type: 'string',
          messages: {
            required: 'spCode is missing',
            type: 'spCode must be of string type'
          }
        },
        sptrn: {
          required: true,
          type: 'string',
          messages: {
            required: 'sptrn is missing',
            type: 'sptrn must be of string type'
          }
        },
        transactionAmount: {
          required: true,
          type: 'string',
          messages: {
            required: 'transactionAmount is missing',
            type: 'transactionAmount must be of string type'
          }
        },
        ePayRefNumber: {
          required: true,
          type: 'string',
          messages: {
            required: 'ePayRefNumber is missing',
            type: 'ePayRefNumber must be of string type'
          }
        },
        PGRefNumber: {
          required: false,
          type: 'string',
          messages: {
            required: 'PGRefNumber is missing',
            type: 'PGRefNumber must be of string type'
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
  acquirer,
  entity
};
