'use strict';

const models = require('../models');

const Documents = models.Documents;

module.exports = {
    findOne
};

function findOne(query) {
    return Documents.findOne(query);
}

