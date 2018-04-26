'use strict';

const models = require('../models');
const _ = require('lodash');

const EmailTemplate = models.EmailTemplate;

function find(payload) {
  const query = {};
  if (_.get(payload, 'searchCriteria.templateName')) {
    query.templateName = { $regex: RegExp(payload.searchCriteria.templateName, 'gi'), $options: 'si' };
  }
  return Promise.all([
    EmailTemplate
      .find(query)
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .lean(true),
    EmailTemplate.count(query)
  ]);
}

function findTypeData() {
  return EmailTemplate.aggregate([
    {
      $project: {
        label: '$templateName', _id: 0
      }
    }
  ]);
}

function findOneById(id) {
  return EmailTemplate
    .findOne({ _id: id })
    .lean(true);
}

function create(payload) {
  return new EmailTemplate(payload).save();
}

function findOneAndUpdate(query, payload) {
  return EmailTemplate
    .findOneAndUpdate(query, payload);
}

module.exports = {
  find,
  findOneById,
  create,
  findTypeData,
  findOneAndUpdate
};

