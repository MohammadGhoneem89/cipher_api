'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const regex = require('../constants/regex');
const commonConst = require('../constants/common');
const msgConst = require('../constants/msg');
const dates = require('../helpers/dates');
const auditLog = require('../services/auditLog');
const _ = require('lodash')

const schema = new Schema({
  firstName: {
    type: String
  },
  network: {
    type: String
  },
  lastName: {
    type: String
  },
  quorrumUser: {
    type: String
  },
  hypUser: {
    type: String
  },
  network: {
    type: String
  },
  email: {
    type: String,
    match: [regex.email, msgConst.user.email]
  },
  userID: {
    type: String,
    required: msgConst.user.userID
  },
  lastResetTime: {
    type: Number,
    default: dates.now
  },
  orgType: {
    type: String,
    enum: commonConst.user.orgType
  },
  orgCode: {
    type: String
  },
  userType: {
    type: String,
    required: msgConst.user.userType,
    enum: commonConst.user.userType
  },
  isActive: {
    type: Boolean,
    default: false
  },
  allowedIPRange: [String],
  passwordPolicy: {
    type: Schema.Types.ObjectId, ref: 'PasswordPolicy'
  },
  passwordRetries: {
    type: Number,
    default: 0
  },
  password: {
    type: String,
    required: msgConst.user.password
  },
  passwordHashType: {
    type: String,
    required: msgConst.user.password
  },
  passwordUpdatedAt: {
    type: Number,
    default: dates.now
  },
  passwordReset: {
    type: String
  },
  profilePic: {
    type: String
  },
  firstScreen: {
    type: String
  },
  entityID: {
    type: Schema.Types.ObjectId, ref: 'Entity'
  },
  acquirerID: {
    type: Schema.Types.ObjectId, ref: 'Acquirer'
  },
  settlementID: {
    type: String // TODO add reference to settlement collection when model created
  },
  isNewUser: {
    type: Boolean
  },
  authType: {
    type: String,
    enum: commonConst.user.authType
  },
  rejectionReason: {
    type: String
  },
  status: {
    type: String
  },
  passwordRetryAt: {
    type: Number
  },
  createdAt: {
    type: Number,
    default: dates.newDate
  },

  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  updatedAt: {
    type: Number,
    default: dates.newDate
  },
  updatedBy: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  groups: [{
    type: Schema.Types.ObjectId, ref: 'Group'
  }],
  services: [Schema.Types.Mixed]
}, { versionKey: false });

schema.pre('findOneAndUpdate', function (next) {
  this.findOne()
    .then((previous) => {
      _.set(this.update, 'passwordReset', undefined);
      _.set(previous, 'passwordReset', undefined);
      let payload = {};
      if (previous) {
        payload = {
          event: commonConst.auditLog.eventKeys.update,
          collectionName: 'User_Interm',
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

const User_Interm = mongoose.model('User_Interm', schema, 'User_Interm');

module.exports = User_Interm;
