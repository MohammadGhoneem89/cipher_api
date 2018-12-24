'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const msgConst = require('../constants/msg');
const dates = require('../helpers/dates');
const auditLog = require('../services/auditLog');
const commonConst = require('../constants/common');

const schema = new Schema({
  templateName: {
    type: String,
    required: msgConst.commissionTemplate.templateName
  },
  discount: {
    type: String,
    default: ''
  },
  commissionDetails: [
    {
      categoryType: {
        type: String
      },
      feeType: {
        type: String
      },
      startDate: {
        type: String,
        default: dates.now
      },
      endDate: {
        type: String,
        default: dates.now
      },
      minVal: {
        type: String
      },
      maxVal: {
        type: String
      },
      percentageRate: {
        type: String
      },
      flatRate: {
        type: String
      }
    }
  ],
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

schema.pre('findOneAndUpdate', function(next) {
  this.findOne()
    .then((previous) => {
      let payload = {};
      if (previous) {
        payload = {
          event: commonConst.auditLog.eventKeys.update,
          collectionName: 'Commission Template',
          ipAddress: this._update.ipAddress,
          current: this._update,
          previous: previous,
          createdBy: this._update.updatedBy
        };
        auditLog.create(payload);
      }
      next();
    });
});

const commissionTemplate = mongoose.model('CommissionTemplate', schema, 'CommissionTemplate');
module.exports = commissionTemplate;
