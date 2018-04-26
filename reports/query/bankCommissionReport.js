'use strict';

const selectWithView = require('../../lib/couch/selectWithView');
const _ = require('lodash');
const amountFormat = require('../../lib/helpers/amountFormat');
const countFormat = require('../../lib/helpers/countFormat');
const dates = require('../../lib/helpers/dates');

function bankCommissionReport(body) {
  const viewUrl = '_design/acquirerCommissionReport/_view/acquirerCommissionReport';
  const channel = 'transactions';
  body = body || {};
  body.query = body.query || {};
  body.query['data.TimeStamp'] = body.query['data.TimeStamp'] || {};
  body.query['data.AcquirerId'] = body.query['data.AcquirerId'] || {};
  const acqId = body.query['data.AcquirerId'].$in || [];
  const fromDate = body.query['data.TimeStamp'].$gte || 0;
  const toDate = body.query['data.TimeStamp'].$lte || dates.newDate() / 1000;
  const option = { startkey: [fromDate], endkey: [toDate], reduce: true, group_level: 2, group: true }; // eslint-disable-line camelcase
  return selectWithView(channel, viewUrl, option)
    .then((res) => {
      let transactions = _.map(res, 'value');
      transactions = _.sortBy(transactions, [(transaction) => transaction.AcquirerId.toLowerCase(), (transaction) => transaction.CardType.toLowerCase()]);
      const templateTrans = [];
      let totalAmount = 0;
      for (let i = 0; i < transactions.length; i += 1) {
        if (acqId.length && acqId.indexOf(transactions[i].AcquirerId) < 0){}
        else {
          templateTrans.push(Object.assign({}, transactions[i]));
          templateTrans[i].AcquirerId = _.get(transactions[(i - 1)], 'AcquirerId') === transactions[i].AcquirerId ? '' : transactions[i].AcquirerId;
          templateTrans[i].acquirerUpperLine = templateTrans[i].AcquirerId === '' ? 'no-upper-line' : 'upper-line';
          templateTrans[i].CardType = _.get(transactions[(i - 1)], 'AcquirerId') === transactions[i].AcquirerId && _.get(transactions[(i - 1)], 'CardType') === transactions[i].CardType ? '' : transactions[i].CardType;
          totalAmount += templateTrans[i].CommissionAmount;
          templateTrans[i].CommissionStartDate = dates.MSddMMyyyy(templateTrans[i].CommissionStartDate * 1000);
          templateTrans[i].CommissionEndDate = dates.MSddMMyyyy(templateTrans[i].CommissionEndDate * 1000);
          templateTrans[i].TransferDate = templateTrans[i].TransferDate ? dates.MSddMMyyyy(templateTrans[i].TransferDate * 1000) : '';
          templateTrans[i].TransferStatus = templateTrans[i].TransferStatus ? 'Transferred' : 'Not Transferred';
          templateTrans[i].CommissionAmount = amountFormat(templateTrans[i].CommissionAmount);
        }
      }
      return {
        total: { count: countFormat(templateTrans.length), amount: amountFormat(totalAmount) },
        criteria: body.criteria,
        couchData: templateTrans,
        content: body.content
      };
    });
}

module.exports = bankCommissionReport;
