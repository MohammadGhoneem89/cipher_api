'use strict';

const selectWithView = require('../../lib/couch/selectWithView');
const _ = require('lodash');
const dates = require('../../lib/helpers/dates');


function entityDashboardSummary(body) {
  
  
 

  const channelExp = 'transactions';
  const channel = 'transactions';
  const startDateArg = body.startKeyWorkboard || dates.addDays(dates.newDate(),-30);
  const endDateArg = body.endKeyWorkboard || dates.addDays(dates.newDate(),1);
  const startDateExp = body.startKey || dates.addDays(dates.newDate(),-30);
  const endDateExp = body.endKey || dates.addDays(dates.newDate(),1);
  const toDate = parseInt(dates.ddMMyyyyformat(endDateArg));
  const fromDate = parseInt(dates.ddMMyyyyformat(startDateArg));
  const toDateExp = parseInt(dates.ddMMyyyyformat(endDateExp));
  const fromDateExp = parseInt(dates.ddMMyyyyformat(startDateExp));
  let viewUrl=null;
  let viewUrlExp=null;
  let option=null;
  let optionExp=null;


  let viewUrlSettlement="_design/lastSettlementDate/_view/lastSettlementDate";
  let optionSettlement = { limit : 1000000, reduce: true, group_level: 1, group: true };
  


  if(body.filter && body.filter.length>0){
     viewUrl = '_design/entityWorkboard/_view/entityWorkboard';
     viewUrlExp = '_design/entityWorkboard/_view/entityWorkboard';
     option = { limit : 1000000, startkey: [body.filter,fromDate], endkey: [body.filter,toDate], reduce: true, group_level: 2, group: true }; // eslint-disable-line camelcase
     optionExp = { limit : 1000000, startkey: [body.filter,fromDateExp], endkey: [body.filter,toDateExp], reduce: true, group_level: 2, group: true }; // eslint-disable-line camelcase
  } else {
     viewUrl = '_design/entityWorkboardByTimestamp/_view/entityWorkboardByTimestamp';
     viewUrlExp = '_design/entityWorkboardByTimestamp/_view/entityWorkboardByTimestamp';
     optionExp = { limit : 1000000, startkey: [fromDate], endkey: [toDate], reduce: true, group_level: 2, group: true }; // eslint-disable-line camelcase
     option = { limit : 1000000, startkey: [fromDateExp], endkey: [toDateExp], reduce: true, group_level: 2, group: true }; // eslint-disable-line camelcase
  }


 let responseArr=[];
  return selectWithView(channel, viewUrl, option).then((response) => {
    responseArr.push(response);
    return selectWithView(channelExp, viewUrlExp, optionExp ).then((responseExp) => {
        responseArr.push(responseExp);
         return selectWithView(channelExp, viewUrlSettlement, optionSettlement ).then((responseSettlement) => {
            responseArr.push(responseSettlement);
            return responseArr;
        });
    });
  });
  
}

module.exports = entityDashboardSummary;
