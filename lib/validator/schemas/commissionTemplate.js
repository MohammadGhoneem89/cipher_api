'use strict';

const common = require('./common');
const dateRegex = require('../../constants/regex');

const getCommission = {
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
          messages: {
            required: 'templateName is missing',
            type: 'templateName must be of string type'
          }
        },
        discount: {
          type: 'string',
          pattern: dateRegex.number,
          required: false,
          messages: {
            required: 'discount is missing',
            type: 'discount must be of string type',
            pattern: 'discount must be number'
          }
        },
        commissionDetails: {
          type: 'array',
          required: true,
          minItems: 1,
          items: {
            properties: {
              cardType: {
                type: 'string',
                required: false,
                messages: {
                  required: 'cardType is missing',
                  type: 'cardType must be of string type'
                }
              },
              feeType: {
                type: 'string',
                required: false,
                messages: {
                  required: 'feeType is missing',
                  type: 'feeType must be of string type'
                }
              },
              startDate: {
                type: 'string',
                pattern: dateRegex.yyyyMMDD,
                required: false,
                messages: {
                  required: 'startDate is missing',
                  type: 'startDate must be of string type',
                  pattern: 'startDate must be of date format'
                }
              },
              endDate: {
                type: 'string',
                pattern: dateRegex.yyyyMMDD,
                required: false,
                messages: {
                  required: 'endDate is missing',
                  type: 'endDate must be of string type',
                  pattern: 'endDate must be of date format'
                }
              },
              minVal: {
                type: 'string',
                pattern: dateRegex.number,
                required: false,
                messages: {
                  required: 'minVal is missing',
                  type: 'minVal must be of string type',
                  pattern: 'minVal must be number'
                }
              },
              maxVal: {
                type: 'string',
                pattern: dateRegex.number,
                required: false,
                messages: {
                  required: 'maxVal is missing',
                  type: 'maxVal must be of string type',
                  pattern: 'maxVal must be number'
                }
              },
              percentageRate: {
                type: 'string',
                pattern: dateRegex.float,
                maximum: 100,
                required: false,
                messages: {
                  required: 'percentageRate is missing',
                  type: 'percentageRate must be of string type',
                  pattern: 'percentageRate must be string e.g (0.1)'
                }
              },
              flatRate: {
                type: 'string',
                pattern: dateRegex.number,
                required: false,
                messages: {
                  required: 'flatRate is missing',
                  type: 'flatRate must be of string type',
                  pattern: 'flatRate must be number'
                }
              }
            }
          },
          messages: {
            required: 'commissionDetails is missing',
            type: 'commissionDetails must be of array type',
            minItems: 'commissionDetails must have at least one item'
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
        templateName: {
          required: true,
          type: 'string',
          messages: {
            required: 'templateName is missing',
            type: 'templateName must be of string type'
          }
        },
        discount: {
          type: 'string',
          pattern: dateRegex.number,
          required: false,
          messages: {
            required: 'discount is missing',
            type: 'discount must be of string type',
            pattern: 'discount must be number'
          }
        },
        commissionDetails: {
          type: 'array',
          required: true,
          minItems: 1,
          items: {
            properties: {
              cardType: {
                type: 'string',
                required: false,
                messages: {
                  required: 'cardType is missing',
                  type: 'cardType must be of string type'
                }
              },
              feeType: {
                type: 'string',
                required: false,
                messages: {
                  required: 'feeType is missing',
                  type: 'feeType must be of string type'
                }
              },
              startDate: {
                type: 'string',
                pattern: dateRegex.yyyyMMDD,
                required: false,
                messages: {
                  required: 'startDate is missing',
                  type: 'startDate must be of string type',
                  pattern: 'startDate must be of date format'
                }
              },
              endDate: {
                type: 'string',
                pattern: dateRegex.yyyyMMDD,
                required: false,
                messages: {
                  required: 'endDate is missing',
                  type: 'endDate must be of string type',
                  pattern: 'endDate must be of date format'
                }
              },
              minVal: {
                type: 'string',
                pattern: dateRegex.number,
                required: false,
                messages: {
                  required: 'minVal is missing',
                  type: 'minVal must be of string type',
                  pattern: 'minVal must be number'
                }
              },
              maxVal: {
                type: 'string',
                pattern: dateRegex.number,
                required: false,
                messages: {
                  required: 'maxVal is missing',
                  type: 'maxVal must be of string type',
                  pattern: 'maxVal must be number'
                }
              },
              percentageRate: {
                type: 'string',
                pattern: dateRegex.float,
                required: false,
                messages: {
                  required: 'percentageRate is missing',
                  type: 'percentageRate must be of string type',
                  pattern: 'percentageRate must be string e.g (0.1)'
                }
              },
              flatRate: {
                type: 'string',
                pattern: dateRegex.number,
                required: false,
                messages: {
                  required: 'flatRate is missing',
                  type: 'flatRate must be of string type',
                  pattern: 'flatRate must be number'
                }
              }

            }
          },
          messages: {
            required: 'commissionDetails is missing',
            type: 'commissionDetails must be of array type',
            minItems: 'commissionDetails must have at least one item'
          }
        }
      }
    }
  }
};

module.exports = {
  getCommission,
  templateDetail,
  templateID,
  create,
  update
};
