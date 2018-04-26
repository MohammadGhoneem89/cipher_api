'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  acquirerName: {
    type: String
  },
  arabicName: {
    type: String
  },
  PGCode: {
    type: String
  },
  shortCode: {
    type: String
  },
  legacyCode: {
    type: String
  },
  isActive: {
    type: Boolean
  },
  acquirerLogo: {
    sizeMedium: {
      type: String
    },
    sizeSmall: {
      type: String
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
const Acquirer = mongoose.model('Acquirer', schema, 'Acquirer');

module.exports = Acquirer;
