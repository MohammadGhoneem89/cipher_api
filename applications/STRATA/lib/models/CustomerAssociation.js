'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    shipmentType: {
        type: String,
        required: true
    },
    customerType: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const CustomerAssociation = mongoose.model('CustomerAssociation', schema, 'CustomerAssociation');

module.exports = CustomerAssociation;
