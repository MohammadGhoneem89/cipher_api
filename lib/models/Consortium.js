'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
  consortiumName: {
    type: String
  },
  consortiumType: {
    type: String
  },
  orgTypes: {
    type: Array
  },
  owner: {
    orgType: {
      type: String
    },
    orgCode: {
      type: String
    }
  },
  directParticipants: [
    {
      orgType: {
        type: String
      },
      orgCode: {
        type: String
      },
      status: {
        type: String
      },
      account: {
        type: String
      }
    }
  ],
  indirectParticipants: [
    {
      orgType: {
        type: String
      },
      orgCode: {
        type: String
      },
      status: {
        type: String
      },
      account: {
        type: String
      }
    }
  ],
  peers: [
    {
      name: {
        type: String
      },
      IP: {
        type: String
      },
      port: {
        type: String
      },
      role: {
        type: String
      },
      DBType: {
        type: String
      },
      DBIP: {
        type: String
      },
      DBPort: {
        type: String
      },
      orgs: {
        type: Array
      }
    }
  ],
  channels: [
    {
      orgType: {
        type: String
      },
      orgs: {
        type: Array
      }
    }
  ],
  smartContractTemplates: [
    {
      templateName: {
        type: String
      },
      files: {
        type: Array
      },
      ABI: {
        type: String
      },
      code: {
        type: String
      },
      description: {
        type: String
      },
      status: {
        type: String
      }
    }
  ],
  deployedContracts: [
    {
      templateName: {
        type: String
      },
      transactionHash: {
        type: String
      },
      bindingId: {
        type: String
      },
      from: {
        type: String
      },
      channel: {
        type: String
      },
      deployedBy: {
        type: String
      },
      deployedOn: {
        type: String
      },
      status: {
        type: String
      }
    }
  ],
  businessApplication: [
    {
      name: {
        type: String
      },
      usedBy: {
        type: Array
      },
      RESTLoginURL: {
        type: String
      }
    }
  ],
  nodes: {
    type: Array
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
const Consortium = mongoose.model('Consortium', schema, 'Consortium');

module.exports = Consortium;
