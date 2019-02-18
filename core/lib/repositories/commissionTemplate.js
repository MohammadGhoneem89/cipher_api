'use strict';

const models = require('../models');
const _ = require('lodash');

const CommissionTemplate = models.CommissionTemplate;

function find(payload) {
  const query = {};
  if (_.get(payload, 'searchCriteria.templateName')) {
    query.templateName = { $regex: RegExp(payload.searchCriteria.templateName, 'gi'), $options: 'si' };
  }
  return Promise.all([
    CommissionTemplate
      .find(query, { templateName: 1 })
      .limit(payload.page.pageSize)
      .skip(payload.page.pageSize * (payload.page.currentPageNo - 1))
      .lean(true),
    CommissionTemplate.count(query)
  ]);
}

function findTypeData() {
  return CommissionTemplate.aggregate([
    {
      $project: {
        label: '$templateName', value: '$_id', _id: 0
      }
    }
  ]);
}

function findOneById(id) {
  return CommissionTemplate
    .findOne({ _id: id })
    .lean(true);
}

function create(payload) {
  return new CommissionTemplate(payload).save();
}

function findOneAndUpdate(query, payload) {
  return CommissionTemplate
    .findOneAndUpdate(query, payload);
}


function findOneAndcreate(payload) {
  return CommissionTemplate.findOne({ templateName: payload.templateName }).collation({ locale: 'en', strength: 2 })
      .then((user) => {
        if (user) {
          const error = { template: 'Template Already exists' };
          throw error;
        }
        return new CommissionTemplate(payload).save();
      });
}


function findOneAndUpdate(query, payload) {
  return CommissionTemplate.findOne({ templateName: payload.templateName, _id: { $ne: query._id } })
      .then((user) => {
        if (user) {
          const error = { template: 'Template Already exists' };
          throw error;
        }
        return CommissionTemplate.findOneAndUpdate(query, payload);
      });
}


module.exports = {
  find,
  findOneById,
  create,
  findTypeData,
  findOneAndUpdate,
  findOneAndcreate
};

