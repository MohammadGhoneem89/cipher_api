'use strict';

const models = require('../models/index');

const onBoarding = models.onBoarding;

function find(payload) {
    const query = {};
    if (payload.searchCriteria.name) {
        query.name = { $regex: RegExp(payload.searchCriteria.name, 'gi'), $options: 'si' };
    }
    if (payload.searchCriteria.status) {
        query.status = { $regex: RegExp(payload.searchCriteria.status, 'gi'), $options: 'si' };
    }
    return Promise.all([
        onBoarding
            .find(query)
            .limit(payload.page.pageSize)
            .skip(payload.page.pageSize * (payload.page.currentPageNo - 1)),
        onBoarding.count(query)
    ]);
}

function findOneById(id) {
    return onBoarding.findOne({ _id: id });
}

function create(payload) {
    return new onBoarding(payload).save();
}

function findOneAndUpdate(query, payload) {
    return onBoarding
        .findOneAndUpdate(query, payload);
}

module.exports = {
    find,
    findOneById,
    create,
    findOneAndUpdate
};

