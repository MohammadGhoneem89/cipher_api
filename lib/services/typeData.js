'use strict';

const _ = require('lodash');
const validator = require('../validator');
const typeDataRepo = require('../repositories/typeData');
const acquirerRepo = require('../repositories/acquirer');
const entityRepo = require('../repositories/entity');

module.exports = {
  find,
  findUserSubtypes
};

function find(payload) {
  return typeDataRepo.findTypeData(payload);
}

function findUserSubtypes(payload) {
  return validator.errorValidate(payload, validator.schemas.typeData.userSubtypes)
    .then(() => {
      const subtypes = {
        SDG: SDG,
        Settlement: Settlement,
        Entity: Entity,
        Acquirer: Acquirer
      };
      return subtypes[payload.userTypeCode]();
    });

  function SDG() {
    return Promise.resolve([]);
  }

  function Settlement() {
    return typeDataRepo.findOne({ typeName: 'settlementCompanies' })
      .then((res) => _.get(res, 'data.settlementCompanies', []));
  }

  function Entity() {
    return entityRepo.find({}, 'entityName shortCode', true)
      .then((entities) => {
        const response = [];
        for (const entity of entities) {
          response.push({
            label: entity.shortCode,
            value: entity.entityName
          });
        }
        return response;
      });
  }

  function Acquirer() {
    return acquirerRepo.find({}, 'acquirerName shortCode', true)
      .then((acquirers) => {
        const response = [];
        for (const acquirer of acquirers) {
          response.push({
            label: acquirer.shortCode,
            value: acquirer.acquirerName
          });
        }
        return response;
      });
  }
}
