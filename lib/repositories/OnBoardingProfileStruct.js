'use strict';

const models = require('../models/index');

const OnBoardingProfileStruct = models.OnBoardingProfileStruct;

function find(payload) {
    const query = {};
    if (payload.searchCriteria.name) {
        query.name = { $regex: RegExp(payload.searchCriteria.name, 'gi'), $options: 'si' };
    }

    return Promise.all([
        OnBoardingProfileStruct
            .find(query)
            .limit(payload.page.pageSize)
            .skip(payload.page.pageSize * (payload.page.currentPageNo - 1)),
        OnBoardingProfileStruct.count(query)
    ]);
}

function findOneById(id) {
    return OnBoardingProfileStruct.findOne({ _id: id });
}

function create(payload) {
    return new OnBoardingProfileStruct(payload).save();
}

function findOneAndUpdate(query, payload) {
    return OnBoardingProfileStruct
        .findOneAndUpdate(query, payload);
}

module.exports = {
    find,
    findOneById,
    create,
    findOneAndUpdate
};

