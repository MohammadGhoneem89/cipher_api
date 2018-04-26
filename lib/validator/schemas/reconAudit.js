'use strict';

const common = require('./common');
const commonConst = require('../../constants/common');

const id = {
  properties: {
    id: common.id
  }
};

const updateStatus = {
  properties: {
    id: common.id,
    transactions: {
      type: 'array',
      required: true,
      minItems: 1,
      items: {
        properties: {
          BLAStatus: {
            required: false,
            type: 'string',
            messages: {
              required: 'BLAStatus is missing',
              type: 'BLAStatus must be of string type'
            }
          },
          BLAMessageID: {
            required: false,
            type: 'string',
            messages: {
              required: 'BLAMessageID is missing',
              type: 'BLAMessageID must be of string type'
            }
          },
          ePayNo: {
            required: false,
            type: 'string',
            messages: {
              required: 'ePayNo is missing',
              type: 'ePayNo must be of string type'
            }
          },
          FPSBatchID: {
            required: false,
            type: 'string',
            messages: {
              required: 'FPSBatchID is missing',
              type: 'FPSBatchID must be of string type'
            }
          }
        }
      },
      messages: {
        required: 'transactions is missing',
        type: 'transactions must be of array type',
        minItems: 'transactions must have atleast one item'
      }
    }
  }
};

const create = {
  properties: {
    fileName: {
      required: false,
      type: 'string',
      messages: {
        required: 'fileName is missing',
        type: 'fileName must be of string type'
      }
    },
    filePath: {
      required: false,
      type: 'string',
      messages: {
        required: 'filePath is missing',
        type: 'filePath must be of string type'
      }
    },
    reqType: {
      required: false,
      type: 'string',
      messages: {
        required: 'reqType is missing',
        type: 'reqType must be of string type'
      }
    },
    code: {
      required: false,
      type: 'string',
      messages: {
        required: 'code is missing',
        type: 'code must be of string type'
      }
    },
    serviceCode: {
      required: false,
      type: 'string',
      messages: {
        required: 'serviceCode is missing',
        type: 'serviceCode must be of string type'
      }
    },
    processedBy: {
      required: false,
      type: 'string',
      messages: {
        required: 'processedBy is missing',
        type: 'processedBy must be of string type'
      }
    },
    processedOn: {
      required: false,
      type: 'string',
      messages: {
        required: 'processedOn is missing',
        type: 'processedOn must be of string type'
      }
    },
    validationSummary: {
      required: false,
      type: 'object',
      messages: {
        required: 'validationSummary is missing',
        type: 'validationSummary must be of object type'
      }
    },
    transactions: {
      required: false,
      type: 'array',
      messages: {
        required: 'transactions is missing',
        type: 'transactions must be of array type'
      }
    }
  }
};

const createTranx = {
  properties: {
    filePath: {
      required: true,
      type: 'string',
      messages: {
        required: 'filePath is missing',
        type: 'filePath must be of string type'
      }
    }
  }
};

const trail = {
  properties: {
    action: common.action,
    id: common.id,
    page: common.page,
    searchCriteria: {
      type: 'object',
      required: true,
      properties: {
        fromDate: common.fromDate,
        toDate: common.toDate,
        pgRefNo: {
          required: false,
          type: 'string',
          messages: {
            required: 'pgRefNo is missing',
            type: 'pgRefNo must be of string type'
          }
        },
        sPRefNo: {
          required: false,
          type: 'string',
          messages: {
            required: 'sPRefNo is missing',
            type: 'sPRefNo must be of string type'
          }
        },
        degRefNo: {
          required: false,
          type: 'string',
          messages: {
            required: 'degRefNo is missing',
            type: 'degRefNo must be of string type'
          }
        },
        tranStatus: {
          required: false,
          type: 'string',
          enum: ['failed', 'success', 'inProgress', 'all'],
          messages: {
            required: 'tranStatus is missing',
            type: 'tranStatus must be of string type',
            enum: 'only failed,success,inProgress,all allowed for tranStatus'
          }
        },
        processor: {
          required: false,
          type: 'string',
          messages: {
            required: 'processor is missing',
            type: 'processor must be of string type'
          }
        },
        entity: {
          required: false,
          type: 'string',
          messages: {
            required: 'processor is missing',
            type: 'processor must be of string type'
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

const list = {
  properties: {
    action: common.action,
    page: common.page,
    searchCriteria: {
      type: 'object',
      required: true,
      properties: {
        fromDate: common.fromDate,
        toDate: common.toDate,
        reqType: {
          required: false,
          type: 'string',
          enum: commonConst.reconAudit.reqType,
          messages: {
            required: 'reqType is missing',
            type: 'reqType must be of string type',
            enum: `only ${commonConst.reconAudit.reqType} allowed`
          }
        },
        actionType: {
          required: false,
          type: 'string',
          messages: {
            required: 'actionType is missing',
            type: 'actionType must be of string type'
          }
        },
        shortCode: {
          required: false,
          type: 'string',
          messages: {
            required: 'shortCode is missing',
            type: 'shortCode must be of string type'
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

const reconAuditDetail = {
  properties: {
    id: common.id,
    searchCriteria: {
      type: 'object',
      required: false,
      properties: {
        fromDate: common.fromDate,
        toDate: common.toDate,
        pgRefNo: {
          required: false,
          type: 'string',
          messages: {
            required: 'pgRefNo is missing',
            type: 'pgRefNo must be of string type'
          }
        },
        sPRefNo: {
          required: false,
          type: 'string',
          messages: {
            required: 'sPRefNo is missing',
            type: 'sPRefNo must be of string type'
          }
        },
        degRefNo: {
          required: false,
          type: 'string',
          messages: {
            required: 'degRefNo is missing',
            type: 'degRefNo must be of string type'
          }
        },
        tranStatus: {
          required: false,
          type: 'string',
          messages: {
            required: 'tranStatus is missing',
            type: 'tranStatus must be of string type'
          }
        },
        processor: {
          required: false,
          type: 'string',
          messages: {
            required: 'processor is missing',
            type: 'processor must be of string type'
          }
        },
        entity: {
          required: false,
          type: 'string',
          messages: {
            required: 'processor is missing',
            type: 'processor must be of string type'
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

const reconAuditTrail = {
  properties: {
    searchCriteria: {
      type: 'object',
      required: false,
      properties: {
        fromDate: common.fromDate,
        toDate: common.toDate,
        reqType: {
          required: false,
          type: 'string',
          enum: commonConst.reconAudit.reqType,
          messages: {
            required: 'reqType is missing',
            type: 'reqType must be of string type',
            enum: `only ${commonConst.reconAudit.reqType} allowed`
          }
        },
        reconType: {
          required: false,
          type: 'string',
          messages: {
            required: 'reconType is missing',
            type: 'reconType must be of string type'
          }
        },
        shortCode: {
          required: false,
          type: 'string',
          messages: {
            required: 'shortCode is missing',
            type: 'shortCode must be of string type'
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

const markStatus = {
  properties: {
    id: common.id
  }
};

module.exports = {
  create,
  updateStatus,
  list,
  id,
  trail,
  createTranx,
  reconAuditDetail,
  reconAuditTrail,
  markStatus
};
