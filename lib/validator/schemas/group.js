'use strict';

const common = require('./common');

const insert = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        name: {
          required: true,
          type: 'string',
          messages: {
            required: 'name is missing',
            type: 'name must be of string type'
          }
        },
        description: {
          required: false,
          type: 'string',
          messages: {
            required: 'description is missing',
            type: 'description must be of string type'
          }
        },
        type: {
          required: true,
          type: 'string',
          messages: {
            required: 'type is missing',
            type: 'type must be of string type'
          }
        },
        checked: {
          type: 'array',
          required: false,
          minItems: 1,
          messages: {
            required: 'checked is missing',
            type: 'checked must be of array type',
            minItems: 'checked must have atleast one item'
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

const update = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        id: {
          required: true,
          type: 'string',
          messages: {
            required: 'id is missing',
            type: 'id must be of string type'
          }
        },
        name: {
          required: true,
          type: 'string',
          messages: {
            required: 'name is missing',
            type: 'name must be of string type'
          }
        },
        description: {
          required: false,
          type: 'string',
          messages: {
            required: 'description is missing',
            type: 'description must be of string type'
          }
        },
        type: {
          required: true,
          type: 'string',
          messages: {
            required: 'type is missing',
            type: 'type must be of boolean type'
          }
        },
        checked: {
          type: 'array',
          required: false,
          minItems: 1,
          messages: {
            required: 'checked is missing',
            type: 'checked must be of array type',
            minItems: 'checked must have atleast one item'
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
    searchCriteria: {
      type: 'object',
      required: true,
      properties: {
        name: {
          required: false,
          type: 'string',
          messages: {
            required: 'name is missing',
            type: 'name must be of string type'
          }
        },
        description: {
          required: false,
          type: 'string',
          messages: {
            required: 'description is missing',
            type: 'description must be of string type'
          }
        },
        type: {
          required: false,
          type: 'string',
          messages: {
            required: 'type is missing',
            type: 'type must be of boolean type'
          }
        }
      },
      messages: {
        required: 'searchCriteria is missing',
        type: 'data must be of object type'
      }
    }
  }
};

module.exports = {
  insert,
  update,
  list
};
