'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');
const auditLog = require('../services/auditLog');
const commonConst = require('../constants/common');

const schema = new Schema({
  templateName: {
    type: String
  },
  templateType: {
    type: String
  },
  subjectEng: {
    type: String
  },
  subjectArabic: {
    type: String
  },
  templateTextEng: {
    type: String
  },
  templateTextArabic: {
    type: String
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

schema.pre('findOneAndUpdate', function(next) {
  this.findOne()
    .then((previous) => {
      let payload = {};
      if (previous) {
        payload = {
          event: commonConst.auditLog.eventKeys.update,
          collectionName: 'Email Template',
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

const emailTemplate = mongoose.model('EmailTemplate', schema, 'EmailTemplate');

module.exports = emailTemplate;
