'use strict';

const models = require('../models');
const CustomerAssociation = models.CustomerAssociation;

module.exports = {
    create,
    update,
    findOne
};

function create(data) {
    return new CustomerAssociation(data).save();
}

function update(query, data) {
    return CustomerAssociation.updateOne(query, data, { runValidators: true });
}

function findOne(query) {
    return CustomerAssociation.findOne(query);
}
