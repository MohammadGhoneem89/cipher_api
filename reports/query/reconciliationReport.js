'use strict';

const find = require('../../lib/couch/find');
const _ = require('lodash');
const date = require('../../lib/helpers/dates');
const amountFormat = require('../../lib/helpers/amountFormat');

function reconciliationReport(body) {
  body.criteria = body.criteria || {};
  body.query = !_.isEmpty(body.query) ? body.query : { data: { $exists: true } };
  body.query = _.merge({ 'data.DocumentName': body.documentName }, body.query);
  return find(body.channel, body.query, body.projection)
    .then((res) => {
      let transactions = _.map(res, 'data', []);
      let total = 0;
      res = res || {};
      transactions = _.orderBy(transactions, ['TimeStamp'], ['desc']);
      for (let i = 0; i < transactions.length; i += 1) {
        transactions[i].TotalBillAmount = transactions[i].TotalBillAmount || 0;
        total += transactions[i].TotalBillAmount;
        if (transactions[i].ISINIT && transactions[i].ISRECN && transactions[i].ISRECV && transactions[i].ISATHR && (transactions[i].TotalBillAmount === transactions[i].EntityBillAmount)) {
          transactions[i].SPStatus = 'Success';
        }
        else {
          transactions[i].SPStatus = '';
        }
        if (transactions[i].ISAUTH && transactions[i].ISRECV && transactions[i].ISATHR && (transactions[i].TotalBillAmount === transactions[i].AuthorizedAmount)) {
          transactions[i].ACQStatus = 'Success';
        }
        else {
          transactions[i].ACQStatus = '';
        }
        transactions[i].TimeStamp = date.MSddMMyyyyHHmmSS(transactions[i].TimeStamp * 1000);
        transactions[i].TotalBillAmount = amountFormat(transactions[i].TotalBillAmount);
      }
      total = _.round(total, 2);
      // transactions = _.sortBy(transactions, [(transaction) => transaction.SPCode.toLowerCase(), (transaction) => transaction.ServiceCode.toLowerCase()]);
      body.criteria.Entity = body.criteria.Entity || 'N / A';
      body.criteria.fromDate = body.criteria.fromDate || 'N / A';
      body.criteria.paymentGateway = body.criteria.paymentGateway || 'N / A';
      body.criteria.cardType = body.criteria.cardType || 'N / A';
      body.criteria.toDate = body.criteria.toDate || 'N / A';
      body.criteria.entityService = body.criteria.entityService || 'N / A';
      body.criteria.Acquirer = body.criteria.Acquirer || 'N / A';
      return {
        totalTransactions: res.length,
        criteria: body.criteria,
        couchData: transactions,
        content: body.content,
        total: amountFormat(total)
      };
    });
}

module.exports = reconciliationReport;

