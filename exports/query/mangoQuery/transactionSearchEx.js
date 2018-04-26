'use strict';

const logger = require('../../../lib/helpers/logger')();
const selectPaginated = require('../../../lib/couch/selectPaginated');
const selectCount = require('../../../lib/couch/selectCount');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

function transactionSearchEx(body) {

  logger.app.info(body, ' [ Transaction Search ] transaction Search req : ');

  let criteria = [];
  if (body) {

    if (body.data.fromDate && body.data.fromDate !== '') {
      let startDate = body.data.fromDate;
      startDate = date.ddMMyyyyFromDate(startDate) / 1000;
      criteria.push({ 'data.TimeStamp': { $gte: startDate } });
    }
    if (body.data.toDate && body.data.toDate !== '') {
      let endDate = body.data.toDate;
      endDate = date.ddMMyyyyToDate(endDate) / 1000 ;
      criteria.push({ 'data.TimeStamp': { $lte: endDate } });
    }
    if (body.data.pgRefNo && body.data.pgRefNo !== '') {
      criteria.push({ 'data.PGRefNumber': body.data.pgRefNo });
    }
    if (body.data.sPRefNo && body.data.sPRefNo !== '') {
      criteria.push({ 'data.BillerRefNo': body.data.sPRefNo });
    }
    if (body.data.degRefNo && body.data.degRefNo !== '') {
      criteria.push({ 'data.PayRef': body.data.degRefNo });
    }
    if (body.data.processor && body.data.processor !== '') {
      criteria.push({ 'data.AcquirerId': body.data.processor });
    }
    if (body.data.entity && body.data.entity !== '') {
      criteria.push({ 'data.SPCode': body.data.entity });
    }
    if (body.data.authorizedStatus && body.data.authorizedStatus !== '') {
      criteria.push({ 'data.ISAUTH': body.data.authorizedStatus == 'Authorized' ? true : false });
    }

    if (body.data.mobileNo && body.data.mobileNo !== '') {
      criteria.push({ 'data.CustomerMobile': { "$regex": body.data.mobileNo } });
    }

    if (body.data.email && body.data.email !== '') {
      criteria.push({ 'data.CustomerEmail': { "$regex": body.data.email } });
    }

    if (body.data.approvalCode && body.data.approvalCode !== '') {
      criteria.push({ 'data.ApprovalCode': { "$regex": body.data.approvalCode } });
    }

    if (body.data.maskedCard && body.data.maskedCard !== '') {
      criteria.push({ 'data.MaskedCardNo': { "$regex": body.data.maskedCard } });
    }

    if (body.data.paymentMethod && body.data.paymentMethod !== '') {
      criteria.push({ 'data.PaymentMethod': body.data.paymentMethod });
    }

    if (body.data.cardType && body.data.cardType !== '') {
      criteria.push({ 'data.CardType': body.data.cardType });
    }


    if ((body.data.settlementPreview && body.data.settlementPreview == true )) {
      criteria.push({ 'data.BatchID': '' });
      criteria.push({ 'data.RefundSettlementBatchID': '' });
    }


    if (body.data.batchID && body.data.batchID !== '') {
      criteria.push({
        "$or": [
          { "data.BatchID": body.data.batchID },
          { "data.RefundSettlementBatchID": body.data.batchID }
        ]
      });
    }
    if (body.data.commissionBatchID && body.data.commissionBatchID !== '') {
      criteria.push({
        "$or": [
          { "data.CommissionBatchID": body.data.commissionBatchID },
          { "data.RefundSettlementBatchID": body.data.RefundCommissionBatchID }
        ]
      });
    }

    if (body.type === 'exception') {
      criteria.push({ 'data.ISException': true });
    }
    else if (body.data.tranStatus && body.data.tranStatus !== '') {
      criteria.push({ 'data.ISException': body.data.tranStatus == 'Reconciled' ? false : true });
    }

    if (body.data.isRefunded && body.data.isRefunded !== '') {
      criteria.push({ 'data.ISRFND': body.data.isRefunded == 'true' ? true : false });
    }

    if (body.data.isSettled && body.data.isSettled !== '') {
      criteria.push({ 'data.ISSTLD': body.data.isSettled == 'true' ? true : false });
    }
    if (body.data.serviceCode && body.data.serviceCode !== '') {
      criteria.push({ 'data.ServiceCode': body.data.serviceCode });
    }


    if (body.data.settlementTranState && body.data.settlementTranState !== '') {
      criteria.push({ 'data.SettlementTranState': body.data.settlementTranState });
    }

    if (body.data.commissionTranState && body.data.settlementTranState !== '') {
      criteria.push({ 'data.CommissionTranState': body.data.commissionTranState });
    }

    if (body.data.settlementTranStatus && body.data.settlementTranStatus !== '') {
      if (body.data.settlementTranStatus == 'Reconciled') {
        criteria.push({
          'data.PayRef': {
            "$in": body.data.ReconciledList.split(',')
          }
        });
      }

      if (body.data.settlementTranStatus == 'Exception') {
        criteria.push({
          'data.PayRef': {
            "$in": body.data.ExceptionList.split(',')
          }
        });
      }

      if (body.data.settlementTranStatus == 'Refunded') {

        criteria.push({
          'data.PayRef': {
            "$in": body.data.RefundList.split(',')
          }
        });
      }
    }
    if (body.data.paymentStatus && body.data.paymentStatus !== '') {
      criteria.push({ 'data.EPayStatusAuthRecv': body.data.paymentStatus });
    }

    if (body.data.exceptionType && body.data.exceptionType !== '') {

      if (body.data.exceptionType == 'SP-SDG') {
        criteria.push({
          "$not": {
            "$and": [
              {
                "data.ISINIT": true
              },
              {
                "data.ISRECV": true
              },
              {
                "data.ISATHR": true
              },
              {
                "data.ISRECN": true
              },
              {
                "data.ErrorDescription": {
                  "$ne": "Amount Mismatch with SP"
                }
              }
            ]
          }
        })
      }
      else if (body.data.exceptionType == 'DEG-PP') {
        criteria.push({
          "$not": {
            "$and": [
              {
                "data.ISAUTH": true
              },
              {
                "data.ISATHR": true
              },
              {
                "data.ErrorDescription": {
                  "$ne": "Amount Mismatch with Bank"
                }
              }
            ]
          }
        })
      }
      else if (body.data.exceptionType == 'SP-SDG-PP')
        criteria.push({ 'data.ISException': true });
    }

    criteria.push({ 'data.DocumentName': 'ConsolidatedView' });
  }
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };



  const pageNo = body.currentPageNo ? body.currentPageNo : 1;
  const pageSize = body.pageSize ? body.pageSize : 10;
  const skip = (pageNo - 1) * pageSize;

  const option = {
    limit: pageSize,
    skip: skip,
    sort: [{ "data.TimeStamp": "asc" }]
  };

  const promises = [];

  promises.push(selectCount(channels.transactions, criteria, ['data.PayRef']));
  promises.push(selectPaginated(channels.transactions, criteria, [], option));

  return Promise.all(promises)
    .then((responses) => {
      const res0 = responses[0];
      let res1 = responses[1];

      let response = res1.data.docs;
      /*if (body.data.IsSettlementBatch) {
        response = setTranDataForSettlementBatch(response, body.data.ReconciledList, body.data.ExceptionList, body.data.RefundList)

      }*/

      return {
        count: res0.data.docs.length,
        data: response
      };
    })
    .catch((err) => {
      logger.app.error(err, ' [ Transaction Search ] transaction Search error : ');
    });
}

function setTranDataForSettlementBatch(transactionList, reconciledList, exceptionList, refundList) {

  for (let i = 0; i < transactionList.length; i++) {

    if (reconciledList.indexOf(transactionList[i].data.PayRef.toString()) > -1) {
      transactionList[i].data.tranStatus = 'Reconciled';

    }
    else if (refundList.indexOf(transactionList[i].data.PayRef.toString()) > -1) {
      transactionList[i].data.tranStatus = 'Refunded';


    }
    else if (exceptionList.indexOf(transactionList[i].data.PayRef.toString()) > -1) {
      transactionList[i].data.tranStatus = 'Exception';


    }
    else {

      transactionList[i].data.tranStatus = ''
    }
  }
  return transactionList;
}

module.exports = transactionSearchEx;


