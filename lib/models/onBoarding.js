'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../helpers/dates');

const schema = new Schema({
    name: {
        type: String
    },
    status: {
        type: String
    },
    useCase: {
        type: String
    },
    DBType: {
        type: String
    },
    destinationDB: {
        type: String
    },
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'OnboardingProfileStruct'
    },
    params: [
        {
            "name": {
                type: String
            },
            "value": {
                type: String
            }
        }
    ],
    tables : {
      type : Array
    },
    createdAt: {
        type: Date,
        default: dates.newDate
    },
    updatedAt: {
        type: Date,
        default: dates.newDate
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

});
const OnboardingProfiles = mongoose.model('OnboardingProfiles', schema, 'OnboardingProfiles');

module.exports = OnboardingProfiles;