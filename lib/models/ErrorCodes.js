'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');
const auditLog = require('../services/auditLog');
const commonConst = require('../constants/common');

const schema = new Schema({
  code: {
    type: String
  },
  description: {
    type: String
  }
});

schema.pre('findOneAndUpdate', function(next) {
  this.findOne()
    .then((previous) => {
      let payload = {};
      if (previous) {
        payload = {
          event: commonConst.auditLog.eventKeys.update,
          collectionName: 'ErrorCodes',
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
schema.index({code: 1}, {unique: true});
const ErrorCodes = mongoose.model('ErrorCodes', schema, 'ErrorCodes');

module.exports = ErrorCodes;
