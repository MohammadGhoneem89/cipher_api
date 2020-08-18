'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const regex = require('../constants/regex');
const commonConst = require('../constants/common');
const msgConst = require('../constants/msg');
const dates = require('../helpers/dates');
const auditLog = require('../services/auditLog');
const _ = require('lodash')
let scheme = {
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
}
const schema = new Schema(scheme, { versionKey: false });

// schema.pre('findOneAndUpdate', function (next) {
//   this.findOne()
//     .then((previous) => {
//       _.set(this.update, 'passwordReset', undefined);
//       _.set(previous, 'passwordReset', undefined);
//       let payload = {};
//       if (previous) {

//         let changes = ""
//         let old = {}, newobj = {};
//         for (let key in scheme) {
//           _.set(old, key, _.get(previous, key, undefined))
//           _.set(newobj, key, _.get(this._update, key, undefined))
//         }

//         for (let key in old) {
//           if (!_.get(this._update, key, undefined))
//             changes += `Field '${key}' removed \n \t old value: ${old[key]} \n`
//           else if (old[key] != newobj[key])
//             changes += `Field '${key}' changed \n \t old value: ${old[key]} \n \t new value: ${this._update[key]} \n`
//         }

//         for (let key in newobj) {
//           if (!_.get(old, key, undefined))
//             changes += `Field '${key}' added \n \t new value: ${newobj[key]} \n`
//         }

//         payload = {
//           event: commonConst.auditLog.eventKeys.update,
//           collectionName: 'User_Interm',
//           ipAddress: this._update.ipAddress,
//           current: this._update,
//           previous: previous,
//           createdBy: this._update.updatedBy,
//           changes: changes
//         };
//         auditLog.create(payload);
//       }
//       next();
//     });
// });

const User_Interm = mongoose.model('User_Interm', schema, 'User_Interm');

module.exports = User_Interm;
