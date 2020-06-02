'use strict';

const common = require('./common');

const get = {
  properties: {
    action: common.action,
    page: {
      currentPageNo: common.currentPageNo,
      pageSize: common.pageSize
    },
    searchCriteria: {
      properties: {
        templateName: {
          required: false,
          type: 'string',
          message: {
            type: 'templateName must be string',
            required: 'templateName is missing'
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

const templateID = {
  required: false,
  type: 'string',
  messages: {
    required: 'templateID is missing',
    type: 'templateID must be of string type'
  }
};

const templateDetail = {
  properties: {
    templateID: templateID,
    action: common.action
  }
};

const update = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        templateName: {
          required: true,
          type: 'string',
          message: {
            required: 'templateName is missing',
            type: 'templateName must be of string type'
          }
        },
        templateType: {
          required: false,
          type: 'string',
          message: {
            required: 'templateType is missing',
            type: 'templateType must be of string type'
          }
        },
        subjectEng: {
          required: false,
          type: 'string',
          message: {
            required: 'subjectEng is missing',
            type: 'subjectEng must be of string type'
          }
        },
        subjectArabic: {
          required: false,
          type: 'string',
          message: {
            required: 'subjectArabic is missing',
            type: 'subjectArabic must be of string type'
          }
        },
        templateTextEng: {
          required: false,
          type: 'string',
          message: {
            required: 'templateTextEng is missing',
            type: 'templateTextEng must be of string type'
          }
        },
        templateTextArabic: {
          required: false,
          type: 'string',
          message: {
            required: 'templateTextArabic is missing',
            type: 'templateTextArabic must be of string type'
          }
        }
      },
      message: {
        required: 'data is missing',
        type: 'data must be object type'
      }
    }
  }
};

const create = {
  properties: {
    action: common.action,
    data: {
      type: 'object',
      required: true,
      properties: {
        templateName: {
          required: true,
          type: 'string',
          message: {
            required: 'templateName is missing',
            type: 'templateName must be of string type'
          }
        },
        templateType: {
          required: false,
          type: 'string',
          message: {
            required: 'templateType is missing',
            type: 'templateType must be of string type'
          }
        },
        subjectEng: {
          required: false,
          type: 'string',
          message: {
            required: 'subjectEng is missing',
            type: 'subjectEng must be of string type'
          }
        },
        subjectArabic: {
          required: false,
          type: 'string',
          message: {
            required: 'subjectArabic is missing',
            type: 'subjectArabic must be of string type'
          }
        },
        templateTextEng: {
          required: false,
          type: 'string',
          message: {
            required: 'templateTextEng is missing',
            type: 'templateTextEng must be of string type'
          }
        },
        templateTextArabic: {
          required: false,
          type: 'string',
          message: {
            required: 'templateTextArabic is missing',
            type: 'templateTextArabic must be of string type'
          }
        }
      },
      message: {
        required: 'data is missing',
        type: 'data must be object type'
      }
    }
  }
};

module.exports = {
  get,
  templateDetail,
  templateID,
  create,
  update
};
