'use strict';

const models = require('../models');

const Payment = models.Payment;

function find(payload) {
    const query = {};
    if (payload.searchCriteria.name) {
        query.name = { $regex: RegExp(payload.searchCriteria.name, 'gi'), $options: 'si' };
    }
    if (payload.searchCriteria.code) {
        query.code = { $regex: RegExp(payload.searchCriteria.code, 'gi'), $options: 'si' };
    }
    return Promise.all([
        Payment
            .find(query)
            .limit(payload.page.pageSize)
            .skip(payload.page.pageSize * (payload.page.currentPageNo - 1)),
        Payment.count(query)
    ]);
}

function findOneById(id) {
    return Payment.findOne({ _id: id });
}

function create(payload) {
    return new Payment(payload).save();
}

function findOneAndUpdate(query, payload) {
    return Payment
        .findOneAndUpdate(query, payload);
}

module.exports = {
    find,
    findOneById,
    create,
    findOneAndUpdate
};

