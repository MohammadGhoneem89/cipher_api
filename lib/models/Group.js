'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');
const auditLog = require('../services/auditLog');
const commonConst = require('../constants/common');
const _ = require('lodash')

const schema = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  usecase: {
    type: String
  },
  type: {
    type: String
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
  permissions: [Schema.Types.Mixed],
  checked: [String],
  orgCode: {
    type: String
  }
});

schema.pre('findOneAndUpdate', function (next) {
  this.findOne()
    .then((previous) => {
      let payload = {};
      if (previous) {
        let changes = ""
        for (let key in previous) {
          if (key == 'permissions') {
            console.log(JSON.stringify(previous))
            let old = _.get(previous, `${key}`, [])
            let newdoc = _.get(this._update, `${key}`, [])


            let permListOld = []
            old.forEach(element => {
              element.children.forEach(element => {
                permListOld.push(element.label)
              });
            });

            let permListNew = []
            newdoc.forEach(element => {
              element.children.forEach(element => {
                permListNew.push(element.label)
              });
            });
            console.log(permListOld.length, permListNew.length)
            if (permListOld.length > permListNew.length) {
              changes += `Permission '${key}' removed \n \t old value: (${permListOld.join(', ')}) \n \t new value: (${permListNew.join(', ')}) \n`
            }

            if (permListOld.length < permListNew.length) {
              changes += `Permission '${key}' added \n \t old value: (${permListOld.join(', ')}) \n \t new value: (${permListNew.join(', ')}) \n`
            }
          }
        }

        console.log(">>>>>>changes>>", changes)
        payload = {
          event: commonConst.auditLog.eventKeys.update,
          collectionName: 'Group',
          ipAddress: this._update.ipAddress,
          current: this._update,
          previous: previous,
          createdBy: this._update.updatedBy,
          changes: changes
        };
        auditLog.create(payload);
      }
      next();
    });
});

const Group = mongoose.model('Group', schema, 'Group');

module.exports = Group;
