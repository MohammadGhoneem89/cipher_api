'use strict';

const common = require('./common');

const getList = {
  properties: {
    action: common.action,
    page: common.page,
    searchCriteria: {
      type: 'object',
      required: true,
      properties: {
        fromDate: common.fromDate,
        toDate: common.toDate,
        event: {
          required: false,
          type: 'string',
          messages: {
            required: 'event is missing',
            type: 'event must be of string type'
          }
        },
        collectionName: {
          required: false,
          type: 'string',
          messages: {
            required: 'collectionName is missing',
            type: 'collectionName must be of string type'
          }
        },
        ipAddress: {
          required: false,
          type: 'string',
          messages: {
            required: 'ipAddress is missing',
            type: 'ipAddress must be of string type'
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

const detail = {
  properties: {
    id: common.id
  }
};

const findAuditLogs = {
  properties: {
    searchCriteria: {
      type: 'object',
      required: false,
      properties: {
        fromDate: common.fromDate,
        toDate: common.toDate,
        event: {
          required: false,
          type: 'string',
          messages: {
            required: 'event is missing',
            type: 'event must be of string type'
          }
        },
        collectionName: {
          required: false,
          type: 'string',
          messages: {
            required: 'collectionName is missing',
            type: 'collectionName must be of string type'
          }
        },
        ipAddress: {
          required: false,
          type: 'string',
          messages: {
            required: 'ipAddress is missing',
            type: 'ipAddress must be of string type'
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
  getList,
  detail,
  findAuditLogs
};
