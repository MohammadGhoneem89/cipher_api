'use strict';

const selectWithView = require('../../lib/couch/selectWithView');
const _ = require('lodash');
const dates = require('../../lib/helpers/dates');
const countFormat = require('../../lib/helpers/countFormat');
const typeDataRepo = require('../../lib/repositories/typeData');

function refundDisputeStatistics(body) {
  const viewUrl = '_design/getRefundDisputeStatistics/_view/getRefundDisputeStatistics';
  const channel = 'transactions';
  body = body || {};
  body.query = body.query || {};
  body.query['data.RFNDTimestamp'] = body.query['data.RFNDTimestamp'] || {};
  const fromDate = body.query['data.RFNDTimestamp'].$gte || 0;
  const toDate = body.query['data.RFNDTimestamp'].$lte || dates.newDate() / 1000;
  const option = { startkey: [fromDate], endkey: [toDate], reduce: true, group_level: 5, group: true }; // eslint-disable-line camelcase
  return Promise.all([
    selectWithView(channel, viewUrl, option),
    typeDataRepo.select({ typeName: 'Payment_Channel' })
  ])
    .then((res) => {
      let transactions = mapKeyValue(res[0], body.query);
      const paymentData = _.get(res, '[1][0].data.Payment_Channel', []);
      transactions = _.sortBy(transactions, [(transaction) => transaction.spCode.toLowerCase(), (transaction) => transaction.serviceCode.toLowerCase(), (transaction) => transaction.paymentMethod.toLowerCase()]);
      transactions = groupByFields(transactions, 'spCode,serviceCode,paymentMethod,paymentChannel');
      const tranList = [];
      for (const prop in transactions) {
        tranList.push(Object.assign(_.get(transactions[prop], 'group[0]', {}), { disputeCnt: _.get(transactions[prop], 'totalDispute', 0), refundCnt: _.get(transactions[prop], 'totalRefund', 0) }));
      }
      transactions = tranList;
      const templateTrans = [];
      let gTotal = 0;
      for (let i = 0; i < transactions.length; i += 1) {
        templateTrans.push(Object.assign({}, transactions[i]));
        templateTrans[i].spCode = _.get(transactions[(i - 1)], 'spCode') === transactions[i].spCode ? '' : transactions[i].spCode;
        templateTrans[i].spCodeUpperLine = templateTrans[i].spCode === '' ? 'no-upper-line' : 'upper-line';
        templateTrans[i].serviceCode = _.get(transactions[(i - 1)], 'serviceCode') === transactions[i].serviceCode && _.get(transactions[(i - 1)], 'spCode') === transactions[i].spCode ? '' : transactions[i].serviceCode;
        templateTrans[i].serviceCodeUpperLine = templateTrans[i].serviceCode === '' ? 'no-upper-line' : 'upper-line';
        templateTrans[i].totalCount = templateTrans[i].disputeCnt + templateTrans[i].refundCnt;
        const payment = _.find(paymentData, { value: templateTrans[i].paymentChannel });
        templateTrans[i].paymentChannel = _.get(payment, 'label', templateTrans[i].paymentChannel);
        gTotal += templateTrans[i].totalCount;
        templateTrans[i].disputePer = (templateTrans[i].disputeCnt / templateTrans[i].totalCount) * 100;
        templateTrans[i].refundPer = (templateTrans[i].refundCnt / templateTrans[i].totalCount) * 100;
        templateTrans[i].disputeCnt = countFormat(templateTrans[i].disputeCnt);
        templateTrans[i].disputePer = countFormat(templateTrans[i].disputePer);
        templateTrans[i].refundCnt = countFormat(templateTrans[i].refundCnt);
        templateTrans[i].refundPer = countFormat(templateTrans[i].refundPer);
        templateTrans[i].totalCount = countFormat(templateTrans[i].totalCount);
      }

      return {
        total: gTotal,
        criteria: body.criteria,
        couchData: templateTrans,
        content: body.content
      };
    });

  function mapKeyValue(list, query) {
    query['data.SPCode'] = query['data.SPCode'] || {};
    query['data.PaymentMethod'] = query['data.PaymentMethod'] || {};
    query['data.paymentChannel'] = query['data.paymentChannel'] || {};
    const spCode = query['data.SPCode'].$in || [];
    const paymentMethod = query['data.PaymentMethod'].$in || [];
    const paymentChannel = query['data.paymentChannel'].$in || [];
    const tranList = [];
    for (const item of list) {
      const details = {
        spCode: _.get(item, 'key[1]', ''),
        serviceCode: _.get(item, 'key[2]', ''),
        paymentMethod: _.get(item, 'key[3]', ''),
        paymentChannel: _.get(item, 'key[4]', '')
      };
      if (spCode.length && spCode.indexOf(details.spCode) < 0) {
        continue;
      }
      if (paymentChannel.length && paymentChannel.indexOf(details.paymentChannel) < 0) {
        continue;
      }
      if (paymentMethod.length && paymentMethod.indexOf(details.paymentMethod) < 0) {
        continue;
      }
      tranList.push(Object.assign(details, item.value));
    }
    return tranList;
  }

  function groupByFields(list, properties) {
    return list.reduce(function(groups, item) {
      const props = properties.split(',');
      let val = '';
      for (const prop of props) {
        val += item[prop];
      }
      groups[val] = groups[val] || {};
      item.disputeCnt = item.disputeCnt || 0;
      item.refundCnt = item.refundCnt || 0;
      groups[val].totalRefund = groups[val].totalRefund || 0;
      groups[val].totalDispute = groups[val].totalDispute || 0;
      groups[val].totalRefund += item.refundCnt;
      groups[val].totalDispute += item.disputeCnt;
      groups[val].group = groups[val].group || [];
      groups[val].group.push(item);
      return groups;
    }, {});
  }

}

module.exports = refundDisputeStatistics;
