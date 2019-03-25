'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');
const auditLog = require('../services/auditLog');
const commonConst = require('../constants/common');

const schema = new Schema({
  typeName: {
    type: String
  },
  attributes: [Schema.Types.Mixed],
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
  }
});

// schema.pre('findOneAndUpdate', function(next) {
//   this.findOne()
//     .then((previous) => {
//       let payload = {};
//       if (previous) {
//         payload = {
//           event: commonConst.auditLog.eventKeys.update,
//           collectionName: 'Group',
//           ipAddress: this._update.ipAddress,
//           current: this._update,
//           previous: previous,
//           createdBy: this._update.updatedBy
//         };
//         auditLog.create(payload);
//       }
//       next();
//     });
// });

const ComplexTypes = mongoose.model('ComplexTypes', schema, 'ComplexTypes');

module.exports = ComplexTypes;
