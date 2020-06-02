'use strict';

const customerAssociationRepo = require('../repositories/customerAssociation');
const _ = require('lodash');

module.exports = {
    create,
    update,
    findOne
};

async function create(payload) {
    let data = { ...payload.data, user: payload.data.userId };
    await customerAssociationRepo.create(data);
    return 'Customer Association inserted successfully';
}

async function update(payload) {
    let { _id } = payload.data;
    let data = _.omit(payload.data, ['_id', 'userId']);
    await customerAssociationRepo.update({ _id }, data);
    return 'Customer Association updated successfully';
}

async function findOne(payload) {
    return await customerAssociationRepo.findOne(payload.data);
}
