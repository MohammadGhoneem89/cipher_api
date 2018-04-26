'use strict';

const logger = require('../../../lib/helpers/logger')();
const selectPaginated = require('../../../lib/couch/selectPaginated');
const selectCount = require('../../../lib/couch/selectCount');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

function commissionSearchList(body,JWToken) {

  logger.app.info(body, ' [ Commission Search ] Commission Search req : ');

  if (JWToken.orgType && (JWToken.orgType == 'Entity' || JWToken.orgType == 'Acquirer')) {
    if (JWToken.orgType == 'Entity') {
      body.entity = JWToken.orgCode;
    }
    if (JWToken.orgType == 'Acquirer') {
      body.processor = JWToken.orgCode;
    }
  }

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
    if (body.data.batchNo && body.data.batchNo !== '') {
      
      criteria.push({ 'data.CommissionBatchNo': body.data.batchNo });
    }
    if (body.data.pgCode && body.data.pgCode !== '') {
      
      criteria.push({ 'data.SPCode': body.data.pgCode });
    }
  

    if (body.data.status && body.data.status !== '') {
      criteria.push({ 'data.Status': body.data.status });
    }
    criteria.push({ 'data.DocumentName': 'Commission' });
  }
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };



  const pageNo = body.currentPageNo ? body.currentPageNo : 1;
  const pageSize = body.pageSize ? body.pageSize : 10;
  const skip = (pageNo - 1) * pageSize;

  const option = {
    limit: pageSize,
    skip: skip,
    sort: [{ "data.INITTimestamp": "asc" }]
  };

  const promises = [];

  promises.push(selectCount(channels.transactions, criteria, ['data.CommissionBatchNo']));
  promises.push(selectPaginated(channels.transactions, criteria, [], option));

  return Promise.all(promises)
    .then((responses) => {
      const res0 = responses[0];
      let res1 = responses[1];

      let response = res1.data.docs;

      return {
        count: res0.data.docs.length,
        data: response
      };
    })
    .catch((err) => {
      logger.app.error(err, ' [ Commission Search ] Commission Search error : ');
    });
}
module.exports = commissionSearchList;


