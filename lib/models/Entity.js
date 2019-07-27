'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    entityName: {
        type: String,
        require: true
    },
    arabicName: {
        type: String
    },
    spCode: {
        type: String
    },
    isActive: {
        type: Boolean
    },
    isConsolidate: {
        type: Boolean
    },
    entityLogo: {
        sizeSmall: {
            type: String
        },
        sizeMedium: {
            type: String
        },
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
            },
            displayMenu: {
                type: Boolean
            }
        }
    ]
});

schema.index({ useCase: 1, route: 1 }, { unique: true });
const Entity = mongoose.model('Entity', schema, 'Entity');

module.exports = Entity;
