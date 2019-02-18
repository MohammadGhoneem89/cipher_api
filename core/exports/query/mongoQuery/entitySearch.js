'use strict';

const logger = require('../../../lib/helpers/logger')();
const projection = require('../projection');

function entityExport(body) {
  return new Promise(function(resolve, reject) {

    logger.app.info(body, ' [ Entity Export ] Entity Export req : ');

    let response = {};

    let where = {};

    const searchCriteria = body || {};

    const criteria = [];
    if (searchCriteria && searchCriteria.entityName) {
      const entityName = searchCriteria.entityName;
      criteria.push({ 'entityName': { '$regex': entityName, '$options': 'si' } });
    }
    if (searchCriteria && searchCriteria.arabicName) {
      const arabicName = searchCriteria.arabicName;
      criteria.push({ 'arabicName': { '$regex': arabicName, '$options': 'si' } });
    }
    if (searchCriteria && searchCriteria.spCode) {
      const spCode = searchCriteria.spCode;
      criteria.push({ 'spCode': { '$regex': spCode, '$options': 'si' } });
    }
    if (searchCriteria && searchCriteria.isActive) {
      criteria.push({ isActive: true });
    }

    where = criteria.length > 0 ? { '$and': criteria } : {};

    global.db.select('Entity', where, projection.mongoCriteria.entity, function(err, entityData) {
      if (err) {
        logger.app.error(err, ' [ Entity Export ] ERROR : ');
        reject(response);
      }
      else if (entityData.length === 0) {
        logger.app.error(' [ Entity Export ] data is empty : ' + entityData.length);
        resolve(response);
      }
      else {
        response = entityData;
        resolve(response);
      }
    });
  });
}

module.exports = entityExport;

