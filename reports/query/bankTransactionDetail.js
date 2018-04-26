'use strict';

const find = require('../../lib/couch/find');
const _ = require('lodash');
const date = require('../../lib/helpers/dates');
const findStatus = require('../../lib/helpers/findStatus');
const amountFormat = require('../../lib/helpers/amountFormat');

function bankTransactionDetail(body) {
  body.query = !_.isEmpty(body.query) ? body.query : { data: { $exists: true } };
  body.query = _.merge({ 'data.DocumentName': body.documentName }, body.query);
  return find(body.channel, body.query, body.projection)
    .then((res) => {

      res = res || {};
      let total = 0;
      res = _.orderBy(res, 'data.TimeStamp', 'desc');
      for (let i = 0; i < res.length; i += 1) {
        res[i].data.count = (i + 1);
        if (res[i].data) {
          res[i].data.Status = findStatus(res[i].data.ISRFND, res[i].data.ISFAIL, res[i].data.EPayStatusAuthRecv, res[i].data.EPayStatusRecv);
          res[i].data.TransactionCaptureDate = date.MSddMMyyyyHHmmSS(res[i].data.TimeStamp * 1000);
          if (res[i].data.TotalBillAmount) {
            total += res[i].data.TotalBillAmount;
          }
          res[i].data.TotalBillAmount = amountFormat(_.get(res[i], 'data.TotalBillAmount'));
          res[i].data.ISRFND = res[i].data.ISRFND ? 'YES' : 'NO';
        }
      }
      total = _.round(total, 2);
      let transactions = _.map(res, 'data', []);
      //transactions = _.sortBy(transactions, [(transaction) => transaction.AcquirerId.toLowerCase(), (transaction) => transaction.CardType.toLowerCase()]);
      //const templateTrans = [];
      //for (let i = 0; i < transactions.length; i += 1) {
      //  templateTrans.push(Object.assign({}, transactions[i]));
      //  templateTrans[i].AcquirerId = _.get(transactions[(i - 1)], 'AcquirerId') === transactions[i].AcquirerId ? '' : transactions[i].AcquirerId;
      //  templateTrans[i].acquirerIdUpperLine = templateTrans[i].AcquirerId === '' ? 'no-upper-line' : 'upper-line';
      //  templateTrans[i].CardType = _.get(transactions[(i - 1)], 'AcquirerId') === transactions[i].AcquirerId && _.get(transactions[(i - 1)], 'CardType') === transactions[i].CardType ? '' : transactions[i].CardType;
      //  templateTrans[i].cardTypeUpperLine = templateTrans[i].CardType === '' ? 'no-upper-line' : 'upper-line';
      //}
      return {
        totalTransactions: res.length,
        criteria: body.criteria,
        couchData: transactions,
        content: body.content,
        total: total
      };
    });

}

module.exports = bankTransactionDetail;
