'use strict';

const projection = require('../projection');
const auditLogRepo = require('../../../lib/services/auditLog');
const dates = require('../../../lib/helpers/dates');

function auditLogs(body) {



  if(body){
    body = body || {};
    body.searchCriteria = body
  }
  return auditLogRepo.findAuditLogs(body, projection.mongoCriteria.auditLogs)
    .then((auditLogs) => {
      for (const auditLog of auditLogs) {
        auditLog.createdAt = dates.MSddMMyyyy(auditLog.createdAt);
      }
      return auditLogs;
    });
}

module.exports = auditLogs;

