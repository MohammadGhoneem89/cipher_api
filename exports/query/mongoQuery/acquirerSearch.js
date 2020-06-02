'use strict';

const logger = require('../../../lib/helpers/logger')();
const projection = require('../projection');

function acquirerExport(body) {

  return new Promise(function(resolve, reject) {
    logger.app.info(body, ' [ Acquirer Export ] acquirer Export req : ');

    let response = {};

    let where = {};

    const searchCriteria = body || {};

    const criteria = [];
    if (searchCriteria && searchCriteria.acquirerName) {
      const acquirerName = searchCriteria['acquirerName'];
      criteria.push({ 'acquirerName': { '$regex': acquirerName, '$options': 'i' } });
    }
    if (searchCriteria && searchCriteria.arabicName) {
      const arabicName = searchCriteria.arabicName;
      criteria.push({ 'arabicName': { '$regex': arabicName, '$options': 'i' } });
    }
    if (searchCriteria && searchCriteria.spCode) {
      const spCode = searchCriteria.spCode;
      criteria.push({ 'spCode': { '$regex': spCode, '$options': 'i' } });
    }
    if (searchCriteria && searchCriteria.isActive) {
      criteria.push({ isActive: true });
    }
    where = criteria.length > 0 ? { '$and': criteria } : {};
    global.db.select('Acquirer', where, projection.mongoCriteria.acquirer, function(err, acquirerData) {
      if (err) {
        logger.app.error(err, ' [ Acquirer Export ] ERROR : ');
        reject(response);
      }
      else if (acquirerData.length === 0) {
        logger.app.error(' [ Acquirer Export ] data is empty : ' + acquirerData.length);
        resolve(response);
      }
      else {
        response = acquirerData;
        resolve(response);
      }
    });
  });
}

module.exports = acquirerExport;

