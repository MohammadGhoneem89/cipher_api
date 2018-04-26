'use strict';

const models = require('../models');
const _ = require('lodash');

const TypeData = models.TypeData;

module.exports = {
  findTypeData,
  select,
  getValues,
  findOne,
  findFields
};

function findTypeData() {
  return TypeData.find({
    'typeName': 'CTEMP_categoryTypes'
  }, {
    'data.CTEMP_categoryTypes': 1
  });
}

function select(query) {
  return TypeData.find(query).lean(true);
}

function getValues(typeName, codes) {
  return TypeData.findOne({ typeName: typeName }).lean(true)
    .then((typeData) => {
      const values = [];
      if (_.indexOf(codes, 'All') >= 0) {
        values.push('All');
      }
      for (const prop in typeData.data) {
        typeData.data[prop] = typeData.data[prop] || [];
        for (const code of codes) {
          const label = _.get(_.find(typeData.data[prop], { value: code }), 'label');
          if (label) {
            values.push(label);
          }
        }
      }
      return values;
    });
}

function findOne(query) {
  return TypeData
    .findOne(query);
}

function findFields(typeName) {
  return TypeData.findOne({ typeName: typeName }).lean(true);
}
