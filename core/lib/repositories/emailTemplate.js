'use strict';

const models = require('../models');
const _ = require('lodash');
let flatten = require('flat');
const EmailTemplate = models.EmailTemplate;
const custom = require('../../core/Common/customFunctions');


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
        label: '$templateName', _id: 1
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

function findAndFormat(id, params) {
  return EmailTemplate
    .findOne({ _id: id })
    .lean(true)
    .then((template) => {
      if (template) {
        let flattenOut = flatten(params, { maxDepth: 3 })
        for (const prop in flattenOut) {
          let replaceVal = _.get(params, prop, "");
          for (const func in custom) {            
            if (_.includes(template.templateTextEng, `{${func}{${prop}}}`) === true) {
              try {
                let newVal = custom[func](replaceVal);
                 console.log(`Replacing>>>>>>>>>>>>>>>>>>>>>>> {${func}{${prop}}} --->`, newVal);
                template.templateTextEng = template.templateTextEng.replace(`{${func}{${prop}}}`, newVal);
                template.templateTextArabic = template.templateTextArabic.replace(`{${func}{${prop}}}`, replaceVal);
              }
              catch (ex) {
                throw new Error("Custom Function execution failed!!")
              }
            }
          }
          template.templateTextEng = template.templateTextEng.replace(`{{${prop}}}`, replaceVal);
          template.templateTextEng = template.templateTextEng.replace(`{{${prop}}}`, replaceVal);
          template.templateTextArabic = template.templateTextArabic.replace(`{{${prop}}}`, replaceVal);
        }
        return template;
      }
      return false;
    });
}

module.exports = {
  find,
  findOneById,
  create,
  findTypeData,
  findOneAndUpdate,
  findAndFormat
};

