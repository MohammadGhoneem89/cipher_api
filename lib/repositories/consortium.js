'use strict';

const models = require('../models');
const _ = require('lodash');

const Consortium = models.Consortium;
const TypeData = models.TypeData;

function find(payload) {
    const query = {};
    if (_.get(payload, 'searchCriteria.consortiumName')) {
        query.consortiumName = { $regex: RegExp(payload.searchCriteria.consortiumName, 'gi'), $options: 'si' };
    }
    if (_.get(payload, 'searchCriteria.consortiumType')) {
        query.consortiumType = { $regex: RegExp(payload.searchCriteria.consortiumType, 'gi'), $options: 'si' };
    }
    return Promise.all([
        Consortium
            .find(query)
            .limit(payload.page.pageSize)
            .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
            .lean(true),
        Consortium.count(query),
        TypeData.findOne({typeName:'Cipher_blockchainType'})
    ]);
}

function findOneById(id) {
    return Consortium
        .findOne({ _id: id })
        .lean(true);
}

function create(payload) {
    return new Consortium(payload).save();
}

function findOneAndUpdate(query, payload) {
    return Consortium
        .findOneAndUpdate(query, payload);
}



module.exports = {
    create,
    find,
    findOneById,
    findOneAndUpdate
};

