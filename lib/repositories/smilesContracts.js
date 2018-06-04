'use strict';

const models = require('../models');
const _ = require('lodash');

const SmilesContracts = models.SmilesContracts;

function findAll(payload) {
    return SmilesContracts
            .find()
            .lean(true);
}

function find(payload) {
    return SmilesContracts
            .find(payload)
            .limit(payload.page.pageSize)
            .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
            .lean(true);
}

function findOneById(id) {
    return SmilesContracts
        .findOne({ _id: id })
        .lean(true);
}

function create(payload) {
    return new SmilesContracts(payload).save();
}

function findOneAndUpdate(query, payload) {
    return SmilesContracts
        .findOneAndUpdate(query, payload);
}



module.exports = {
    create,
    find,
    findAll,
    findOneById,
    findOneAndUpdate
};

