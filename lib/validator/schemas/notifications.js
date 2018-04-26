'use strict';

const common = require('./common');

const create = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        text: {
          required: false,
          type: 'string',
          messages: {
            required: 'text is missing',
            type: 'text must be of string type'
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
        orgCode: {
          required: false,
            type: 'string',
              messages: {
              required: 'orgCode is missing',
              type: 'orgCode must be of string type'
            }
        },
        type: {
          required: false,
          type: 'string',
          messages: {
            required: 'type is missing',
            type: 'type must be of string type'
          }
        },
        params: {
          required: false,
          type: 'string',
          messages: {
            required: 'params is missing',
            type: 'params must be of string type'
          }
        },
        labelClass: {
          required: false,
          type: 'string',
          messages: {
            required: 'labelClass is missing',
            type: 'labelClass must be of string type'
          }
        },
        createdBy: {
          required: false,
          type: 'string',
          messages: {
            required: 'createdBy is missing',
            type: 'createdBy must be of string type'
          }
        },
        userId: {
          required: false,
          type: 'string',
          messages: {
            required: 'userId is missing',
            type: 'userId must be of string type'
          }
        },
        userID: {
          required: false,
          type: 'string',
          messages: {
            required: 'userID is missing',
            type: 'userID must be of string type'
          }
        },
        groups: {
          required: false,
          type: 'array',
          messages: {
            required: 'groups is missing',
            type: 'groups must be of array type'
          }
        },
        groupName: {
          required: false,
          type: 'string',
          messages: {
            required: 'groups is missing',
            type: 'groups must be of string type'
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

const list = {
  properties: {
    action: common.action,
    page: common.page,
    sortBy: {
      type: 'object',
      required: false,
      properties: {
        createdAt: {
          required: false,
          type: 'number',
          enum: [1, -1],
          messages: {
            required: 'createdAt is missing',
            type: 'createdAt must be of number type',
            enum: 'createdAt must be 1,-1'
          }
        }
      },
      messages: {
        required: 'sortBy is missing',
        type: 'sortBy must be of object type'
      }
    }
  }
};

const markAsRead = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        _id: {
          required: false,
          type: 'string',
          messages: {
            required: '_id is missing',
            type: '_id must be of string type'
          }
        },
        ids: {
          required: false,
          type: 'array',
          messages: {
            required: 'ids is missing',
            type: 'ids must be of number type'
          }
        },
        userId: {
          required: false,
          type: 'string',
          messages: {
            required: 'userId is missing',
            type: 'userId must be of number type'
          }
        },
        userID: {
          required: false,
          type: 'string',
          messages: {
            required: 'userID is missing',
            type: 'userID must be of number type'
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
  create,
  list,
  markAsRead
};

