<<<<<<< HEAD:applications/WASL/lib/models/Payment.js
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../../../../lib/helpers/dates');

const schema = new Schema({
    name: {
        type: String
    },
    code: {
        type: String
    },
    beneficiaryInfo: [
        {
            key: {
                type: String
            },
            value: {
                type: String
            }
        }
    ],
    createdAt: {
        type: Date,
        default: dates.newDate
    },
    updatedAt: {
        type: Date,
        default: dates.newDate
    },
    createdBy: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId, ref: 'User'
    }

});
const Payment = mongoose.model('Payment', schema, 'Payment');

module.exports = Payment;
=======
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dates = require('../../../../lib/helpers/dates');

const schema = new Schema({
    name: {
        type: String
    },
    code: {
        type: String
    },
    beneficiaryInfo: [
        {
            key: {
                type: String
            },
            value: {
                type: String
            }
        }
    ],
    createdAt: {
        type: Date,
        default: dates.newDate
    },
    updatedAt: {
        type: Date,
        default: dates.newDate
    },
    createdBy: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId, ref: 'User'
    }

});
const Payment = mongoose.model('Payment', schema, 'Payment');

module.exports = Payment;
>>>>>>> origin/wasl_property_project:applications/WASL/lib/models/Payment.js
