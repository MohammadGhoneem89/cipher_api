'use strict';

const logger = require('../../../lib/helpers/logger')();
const projection = require('../projection');
const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

function commissionListExport(body) {

  logger.app.info(body, ' [ Commission List Export ] Commission List Export req : ');

  let criteria = [];
  let gte = {};
  let lte = {};
  if (body) {
    const startDate = body.fromDate;
    const endDate = body.toDate;
    const start = date.ddMMyyyyMS(startDate) / 1000;
    const end = date.ddMMyyyyMS(endDate) / 1000;
    criteria.push({ 'data.DocumentName': 'ConsolidatedView' });
    if (start > end) {
      if (start) {
        gte = { $gte: start };
      }
      if (end) {
        lte = { $lte: end };
      }
      const createdAt = Object.assign(gte, lte);
      if (Object.keys(createdAt) > 0) {
        criteria.push({ 'data.TimeStamp': createdAt });
      }
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

    /* if(body.exceptionType){
         criteria.push({ 'data.exceptionType': body.exceptionType });
         }*/
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
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };

  const format = [];

  const mangoQuery = {
    'selector': criteria,
    'fields': projection.mangoCriteria.exception
  };

  return select(channels.exceptions, mangoQuery)
    .then((res) => {

      res = res.data.docs;
      for (let i = 0; i < res.length; i += 1) {
        format.push({
          'Entity': res[i].data.SPCode,
          'Processor': res[i].data.AcquirerId,
          'DEGRefNo': res[i].data.PayRef,
          'TransactionDate': date.MSddMMyyyy(res[i].data.TransactionCaptureDate),
          'ExceptionType': res[i].data.ISException,
          'UserID': res[i].data.UserInfoUserId
        });
      }
      return format;
    });
}

module.exports = commissionListExport;

