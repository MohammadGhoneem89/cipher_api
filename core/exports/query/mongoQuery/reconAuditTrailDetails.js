'use strict';

const dates = require('../../../lib/helpers/dates');
const reconAuditService = require('../../../lib/services/reconAudit');

function reconAuditTrailDetails(body) {
  body = body || {};
 let obj = {
   id : body.id,
   searchCriteria : body.searchCriteria || body,
   action : "reconAuditTrail",
   page : {
     pageSize : 1000000,
     currentPageNo : 1
   }
 };
  return reconAuditService.trail(obj)
    .then((reconAudits) => {
      const format = [];
        for(let i of reconAudits.trail.transactions){
          format.push({
            "ePayNo" : i.ePayNo,
            "SPRefNo" : i.SPTRN,
            "PGRefNo" : i.PGRefNo,
            "transactionDate" : dates.MSddMMyyyyHHmmSS(i.transDate),
            "amount" : i.amount,
            "status" : i.status,
            "description" : i.desc.toString().replace(",", "<br/>")
          });
        }
      return format;
    });
}

module.exports = reconAuditTrailDetails;

