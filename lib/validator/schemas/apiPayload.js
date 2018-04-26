'use strict';

const common = require('./common');

const get = {
  properties: {
    action: common.action,
    page: common.page,
    searchCriteria: {
      type: 'object',
      required: true,
      properties: {
        uuid: {
          required: false,
          type: 'string',
          messages: {
            required: 'uuid is missing',
            type: 'uuid must be of string type'
          }
        },
        channel: {
          required: false,
          type: 'string',
          messages: {
            required: 'channel is missing',
            type: 'channel must be of string type'
          }
        },
        action: {
          required: false,
          type: 'string',
          messages: {
            required: 'action is missing',
            type: 'action must be of string type'
          }
        },
        payloadField: {
          required: false,
          type: 'string',
          messages: {
            required: 'payloadField is missing',
            type: 'payloadField must be of string type'
          }
        },
        payloadFieldValue: {
          required: false,
          type: 'string',
          messages: {
            required: 'payloadFieldValue is missing',
            type: 'payloadFieldValue must be of string type'
          }
        },
        actions: {
          required: false,
          type: 'array',
          minItems: 0,
          messages: {
            required: 'actions is missing',
            type: 'actions must be of array type',
            minItems: 'actions must have minimum one item'
          }
        },
        fromDate: common.fromDate,
        toDate: common.toDate
      },
      messages: {
        required: 'searchCriteria is missing',
        type: 'searchCriteria must be of object type'
      }
    }
  }
};

const details = {
  properties: {
    action: common.action,
    id: {
      required: true,
      type: 'string',
      messages: {
        required: 'id is missing',
        type: 'id must be of string type'
      }
    }
  }
};

const replay = {
  properties: {
    action: common.action,
    fromDate: common.fromTime,
    toDate: common.toTime
  }
};

module.exports = {
  get,
  details,
  replay
};
