'use strict';

const regexConst = require('../../constants/regex');
const moment = require('moment');

const action = {
  required: true,
  type: 'string',
  messages: {
    required: 'action is missing',
    type: 'action must be of string type'
  }
};

const URI = {
  required: true,
  type: 'string',
  messages: {
    required: 'URI is missing',
    type: 'URI must be of string type'
  }
};

const entityID = {
  properties: {
    data: {
      type: 'object',
      required: true,
      properties: {
        entityID: {
          required: true,
          type: 'string',
          messages: {
            required: 'entityID is missing',
            type: 'entityID must be of string type'
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

const acquirerID = {
  properties: {
    data: {
      type: 'object',
      required: true,
      properties: {
        acquirerID: {
          required: true,
          type: 'string',
          messages: {
            required: 'acquirerID is missing',
            type: 'acquirerID must be of string type'
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

const settlementID = {
  properties: {
    data: {
      type: 'object',
      required: true,
      properties: {
        settlementID: {
          required: true,
          type: 'string',
          messages: {
            required: 'settlementID is missing',
            type: 'settlementID must be of string type'
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
const templateName = {
  required: true,
  type: 'string',
  messages: {
    required: 'templateName is missing',
    type: 'templateName must be of string type'
  }
};

const id = {
  required: true,
  type: 'string',
  messages: {
    required: 'id is missing',
    type: 'id must be of string type'
  }
};

const currentPageNo = {
  required: true,
  type: 'number',
  minimum: 1,
  messages: {
    required: 'currentPageNo is missing',
    minimum: 'currentPageNo must be greater than 0',
    type: 'currentPageNo must be of number type'
  }
};

const pageSize = {
  required: true,
  type: 'number',
  minimum: 1,
  messages: {
    required: 'pageSize is missing',
    minimum: 'pageSize must be greater than 0',
    type: 'pageSize must be of number type'
  }
};

const page = {
  type: 'object',
  required: true,
  properties: {
    pageSize: pageSize,
    currentPageNo: currentPageNo
  },
  messages: {
    required: 'page is missing',
    type: 'page must be of object type'
  }
};

const fromDate = {
  required: false,
  type: 'string',
  pattern: regexConst.ddMMYYYY,
  messages: {
    required: 'fromDate is missing',
    pattern: 'fromDate must be of date pattern',
    type: 'fromDate must be of date type'
  }
};

const toDate = {
  required: false,
  type: 'string',
  pattern: regexConst.ddMMYYYY,
  messages: {
    required: 'toDate is missing',
    pattern: 'toDate must be of date pattern',
    type: 'toDate must be of date type'
  }
};

const timeFormat = 'DD/MM/YYYY hh:mm:ss';

const fromTime = {
  required: true,
  type: 'string',
  messages: {
    required: 'fromDate is missing',
    type: 'fromDate must be of string type'
  },
  conform: function(value) {
    return moment(value, timeFormat).isValid();
  },
  message: `fromDate must be of ${timeFormat} format`
};

const toTime = {
  required: true,
  type: 'string',
  messages: {
    required: 'toDate is missing',
    type: 'toDate must be of string type'
  },
  conform: function(value) {
    return moment(value, timeFormat).isValid();
  },
  message: `toDate must be of ${timeFormat} format`
};

const fromDateReq = {
  required: true,
  type: 'string',
  pattern: regexConst.ddMMYYYY,
  messages: {
    required: 'fromDate is missing',
    pattern: 'fromDate must be of date pattern',
    type: 'fromDate must be of date type'
  }
};

const toDateReq = {
  required: true,
  type: 'string',
  pattern: regexConst.ddMMYYYY,
  messages: {
    required: 'toDate is missing',
    pattern: 'toDate must be of date pattern',
    type: 'toDate must be of date type'
  }
};

module.exports = {
  action,
  URI,
  id,
  entityID,
  settlementID,
  acquirerID,
  templateName,
  currentPageNo,
  pageSize,
  page,
  fromDate,
  toDate,
  fromDateReq,
  toDateReq,
  toTime,
  fromTime
};
