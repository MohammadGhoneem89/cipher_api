'use strict';

const logger = require('../../../lib/helpers/logger')();
const select = require('../../../lib/couch/selectPaginated');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

function getTransaction(body) {

  logger.app.info(body, ' [ transaction Export ] transaction Export req : ');

  const criteria = [];
  if (body) {

    const startDate = body.fromDate;
    const endDate = body.toDate;

    const start = date.ddMMyyyyMS(startDate) / 1000;
    const end = date.ddMMyyyyMS(endDate) / 1000;
    if (start && end) {
      criteria.push({ 'data.TimeStamp': { '$gte': 1510551700 } });
      criteria.push({ 'data.TimeStamp': { '$lte': 1511903674 } });
    }
    if (body.pgRefNo && body.pgRefNo !== '') {
      criteria.push({ 'data.PGRefNumber': body.pgRefNo });
    }
    if (body.sPRefNo && body.sPRefNo !== '') {
      criteria.push({ 'data.BillerRefNo': body.sPRefNo });
    }
    if (body.degRefNo && body.degRefNo !== '') {
      criteria.push({ 'data.PayRef': body.degRefNo });
    }
    if (body.tranStatus && body.tranStatus !== '') {
      criteria.push({ 'data.Status': body.tranStatus });
    }
    if (body.processor && body.processor !== '') {
      criteria.push({ 'data.AcquirerId': body.processor });
    }
    if (body.entity && body.entity !== '') {
      criteria.push({ 'data.SPCode': body.entity });
    }
  }

  const format = [];

  const mangoQuery = {
    'data.DocumentName': 'ConsolidatedView',
    '$and': criteria
  };

  const Options = {
    'limit': 5,
    'skip': 0
    // 'fields': projection.mangoCriteria.transaction
  };

  let projections;
  return select(channels.transactions, mangoQuery, projections, Options)
    .then((res) => {
      res = res.data.docs;

      for (let i = 0; i < res.length; i += 1) {
        format.push({
          'Entity': res[i].data.SPCode,
          'Processor': res[i].data.AcquirerId,
          'ePayRefNo': res[i].data.PayRef,
          'SPRefNo': res[i].data.BillerRefNo,
          'PGRefNo': res[i].data.PGRefNumber,
          'Service': res[i].data.ServiceCode,
          'TransactionDate': res[i].data.TransactionCaptureDate,
          'Status': res[i].data.Status,
          'Amount': res[i].data.TotalBillAmount
        });
      }
      return format;
    });
}

module.exports = getTransaction;
