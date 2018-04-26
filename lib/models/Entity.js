'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  entityName: {
    type: String
  },
  arabicName: {
    type: String
  },
  spCode: {
    type: String
  },
  shortCode: {
    type: String
  },
  legacyCode: {
    type: String
  },
  services: [
    {
      serviceName: {
        type: String
      },
      serviceCode: {
        type: String
      }
    }
  ],
  isActive: {
    type: Boolean
  },
  entityLogo: {
    sizeMedium: {
      type: String
    },
    sizeSmall: {
      type: String
    }
  },
  parentEntity: {
    type: Schema.Types.ObjectId, ref: 'Entity'
  },
  accounting: {
    type: Object,
    properties: {
      GISAccountNo: {
        type: String
      },
      exemptedTillDate: {
        type: String
      },
      notifyBeforeMonth: {
        type: String
      }
    }
  },
  commissionTemplate: {
    type: Schema.Types.ObjectId, ref: 'CommissionTemplate'
  },
  recon: {
    integrationType: {
      type: String
    },
    lastNotification: {
      type: String
    },
    fileFormatTemplate: {
      type: String
    },
    noOfDays: {
      type: String
    },
    serverDetails: {
      sFTPServer: {
        type: String
      },
      fileFormatTemplate: {
        type: String
      },
      port: {
        type: String
      },
      username: {
        type: String
      },
      password: {
        type: String
      },
      certificate: {
        type: String
      },
      serverIP: {
        type: String
      }
    }
  },
  settlement: {
    settlementCriteria: {
      type: String
    },
    settlementType: {
      type: String
    },
    autoPeriod: {
      type: String
    },
    escalationAfter: {
      type: String
    }
  },
  contacts: [
    {
      contactName: {
        type: String
      },
      email: {
        type: String
      },
      mobile: {
        type: String
      }
    }
  ],
  documents: [
    {
      _id: {
        type: String
      },
      documentName: {
        type: String
      },
      fileType: {
        type: String
      },
      retrievalPath: {
        type: String
      },
      documentHash: {
        type: String
      }
    }
  ],
  status: {
    value: {
      type: String
    },
    type: {
      type: String
    }
  },
  lastReconDate: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: dates.newDate
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: dates.newDate
  },
  updatedBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  }
});

const Entity = mongoose.model('Entity', schema, 'Entity');

module.exports = Entity;
