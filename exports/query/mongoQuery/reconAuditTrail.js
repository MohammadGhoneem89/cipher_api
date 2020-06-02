'use strict';

const projection = require('../projection');
const dates = require('../../../lib/helpers/dates');
const reconAuditService = require('../../../lib/services/reconAudit');
const _ = require("lodash");

function reconAuditTrail(body) {
    let payload = {
        searchCriteria : body,
        action : "",
        page : {
            pageSize : 1000000,
            currentPageNo : 1
        }
    };
  return reconAuditService.list2(payload)
    .then((reconAudits) => {
          let recons = _.sortBy(reconAudits[0],[function(o){return o.createdAt}]);
          for(let i of recons){
            if(i.reqType){
                if(i.reqType === "E"){
                    i.reqType = "Entity";
                }
                else{
                    i.reqType = "Acquirer";
                }
            }
          }
        return recons;
    });
}

module.exports = reconAuditTrail;

