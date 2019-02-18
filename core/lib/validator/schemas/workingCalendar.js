'use strict';

const common = require('./common');

const get = {
  properties: {
    action: common.action,
    page: {
      properties: {
        currentPageNo: common.currentPageNo,
        pageSize: common.pageSize
      }
    },
    searchCriteria: {
      properties: {
        calendarYear: {
          required: false,
          type: 'string',
          message: {
            type: 'calendarYear must be string',
            required: 'calendarYear is missing'
          }
        },
        calendarName: {
          required: false,
          type: 'string',
          message: {
            type: 'calendarName must be string',
            required: 'calendarName is missing'
          }
        },
        isActive: {
          required: false,
          type: 'string',
          message: {
            type: 'isActive must be string',
            required: 'isActive is missing'
          }
        }
      },
      message: {
        'type': 'searchCriteria must be object',
        'required': 'searchCriteria is missing'
      }
    }
  }
};

const calendarID = {
  required: true,
  type: 'string',
  messages: {
    required: 'calendarID is missing',
    type: 'calendarID must be of string type'
  }
};

const calendarDetail = {
  properties: {
    calendarID: calendarID,
    action: common.action
  }
};

const create = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        calendarName: {
          required: true,
          type: 'string',
          messages: {
            required: 'calendarName is missing',
            type: 'calendarName must be of string type'
          }
        },
        calendarYear: {
          required: true,
          type: 'string',
          messages: {
            required: 'calendarYear is missing',
            type: 'calendarYear must be of string type'
          }
        }
      }
    }
  }
};

const update = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        calendarName: {
          required: true,
          type: 'string',
          messages: {
            required: 'calendarName is missing',
            type: 'calendarName must be of string type'
          }
        },
        calendarYear: {
          required: true,
          type: 'string',
          messages: {
            required: 'calendarYear is missing',
            type: 'calendarYear must be of string type'
          }
        }
      },
      message: {
        required: 'data is missing',
        type: 'data must be of object type'
      }
    }
  }
};

module.exports = {
  get,
  calendarDetail,
  calendarID,
  create,
  update
};
