'use strict';

const logger = require('../../../lib/helpers/logger')();
const selectPaginated = require('../../../lib/couch/selectPaginated');
const selectCount = require('../../../lib/couch/selectCount');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

function getCriteriaSettlement(body){

  let criteria = [];
  if (body) {

    if (body.data.fromDate && body.data.fromDate !== '') {
      let startDate = body.data.fromDate;
      startDate = date.ddMMyyyyFromDate(startDate) / 1000;
      criteria.push({ 'data.INITTimestamp': { $gte: startDate } });
    }
    if (body.data.toDate && body.data.toDate !== '') {
      let endDate = body.data.toDate;
      endDate = date.ddMMyyyyToDate(endDate) / 1000;
      criteria.push({ 'data.INITTimestamp': { $lte: endDate } });
    }

    if (body.data.entity && body.data.entity !== '') {
      criteria.push({ 'data.SPCode': body.data.entity });
    }
	
    criteria.push({ 'data.DocumentName': 'Settlement' });
  }
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };
  return criteria;
}

function getCriteriaCommission(body){

  let criteria = [];
  if (body) {

    if (body.data.fromDate && body.data.fromDate !== '') {
      let startDate = body.data.fromDate;
      startDate = date.ddMMyyyyFromDate(startDate) / 1000;
      criteria.push({ 'data.StartDate': { $gte: startDate } });
    }
    if (body.data.toDate && body.data.toDate !== '') {
      let endDate = body.data.toDate;
      endDate = date.ddMMyyyyToDate(endDate) / 1000;
      criteria.push({ 'data.StartDate': { $lte: endDate } });
    }

    
    criteria.push({ 'data.DocumentName': 'Commission' });
  }
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };
  return criteria;
}




function getCriteriaRefunds(body){

  let criteria = [];
  if (body) {

    if (body.data.fromDate && body.data.fromDate !== '') {
      let startDate = body.data.fromDate;
      startDate = date.ddMMyyyyFromDate(startDate) / 1000;
      criteria.push({ 'data.REFUNDINITTS': { $gte: startDate } });
    }
    if (body.data.toDate && body.data.toDate !== '') {
      let endDate = body.data.toDate;
      endDate = date.ddMMyyyyToDate(endDate) / 1000;
      criteria.push({ 'data.REFUNDINITTS': { $lte: endDate } });
    }

    if (body.data.entity && body.data.entity !== '') {
      criteria.push({ 'data.SPCode': body.data.entity });
    }
	
    criteria.push({ 'data.DocumentName': 'RefundView' });
  }
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };
  return criteria;
}

function getCriteriaDisputes(body){

  let criteria = [];
  if (body) {

    if (body.data.fromDate && body.data.fromDate !== '') {
      let startDate = body.data.fromDate;
      startDate = date.ddMMyyyyFromDate(startDate) / 1000;
      criteria.push({ 'data.DISPUTEINITTS': { $gte: startDate } });
    }
    if (body.data.toDate && body.data.toDate !== '') {
      let endDate = body.data.toDate;
      endDate = date.ddMMyyyyToDate(endDate) / 1000;
      criteria.push({ 'data.DISPUTEINITTS': { $lte: endDate } });
    }

    if (body.data.entity && body.data.entity !== '') {
      criteria.push({ 'data.SPCode': body.data.entity });
    }
	
    criteria.push({ 'data.DocumentName': 'DisputeView' });
  }
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };
  return criteria;
}

function SLASearchEx(body) {

  logger.app.info(body, ' [ SLA Data ] SLA Data : ');

  let criteriaSettlement = getCriteriaSettlement(body);
  let criteriaRefunds = getCriteriaRefunds(body);
  let criteriaDisputes = getCriteriaDisputes(body);
  let criteriaCommission = getCriteriaCommission(body);

  const option = {
    limit: 100000
  };

  const promises = [];
  let fieldsSettlement = ["_id","data.INITTimestamp","data.APRVTimestamp","data.INITBy","data.CNCLTimestamp", "data.CNCLBy", "data.APRVBy","data.Status"]
  let fieldsRefunds = ["_id","data.REFUNDINITTS","data.REFUNDAPRVTS","data.REFUNDCNCLTS","data.REFUNDINITBY","data.REFUNDAPRVBY","data.REFUNDCNCLBY","data.Status"]
  let fieldsDisputes = ["_id","data.DISPUTEINITTS","data.DISPUTEFRWDTS","data.DISPUTEAPRVTS","data.DISPUTECNCLTS","data.DISPUTEINITBY","data.DISPUTEFRWDBY","data.DISPUTEAPRVBY","data.DISPUTECNCLBY","data.Status"]
  let fieldsCommission = ["_id","data.INITTimestamp","data.APRVTimestamp","data.INITBy","data.CNCLTimestamp", "data.CNCLBy", "data.APRVBy","data.Status"]
    

  
  promises.push(selectPaginated(channels.transactions, criteriaSettlement , fieldsSettlement , option));
  promises.push(selectPaginated(channels.transactions, criteriaRefunds , fieldsRefunds , option));
  promises.push(selectPaginated(channels.transactions, criteriaDisputes , fieldsDisputes , option));
  promises.push(selectPaginated(channels.transactions, criteriaCommission , fieldsCommission , option));



  return Promise.all(promises)
    .then((responses) => {
      const res0 = responses[0];
      const res1 = responses[1];
      const res2 = responses[2];
      const res3 = responses[3];

      return {
        settlement: res0,
        refunds: res1,
        disputes: res2,
        commission : res3
      };
    })
    .catch((err) => {
      logger.app.error(err, ' [ SLA ] SLA Search error : ');
    });
}

module.exports = SLASearchEx;


