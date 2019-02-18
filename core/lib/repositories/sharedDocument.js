'use strict';

const models = require('../models');

const SharedDocument = models.SharedDocument;

module.exports = {
    findOne
};

function findOne(query) {
    return SharedDocument.findOne(query);
}

