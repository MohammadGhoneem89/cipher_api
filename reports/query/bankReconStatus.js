'use strict';

const selectWithView = require('../../lib/couch/selectWithView');
const _ = require('lodash');
const dates = require('../../lib/helpers/dates');
const acquirerRepo = require('../../lib/repositories/acquirer');
const amountFormat = require('../../lib/helpers/amountFormat');
const countFormat = require('../../lib/helpers/countFormat');

function bankReconStatus(body) {
  const viewUrl = '_design/entityReconSummary/_view/entityReconSummary';
  const channel = 'transactions';
  body = body || {};
  body.query = body.query || {};
  body.query['data.TimeStamp'] = body.query['data.TimeStamp'] || {};
  const fromDate = body.query['data.TimeStamp'].$gte || 0;
  const toDate = body.query['data.TimeStamp'].$lte || dates.newDate() / 1000;
  const option = { startkey: [fromDate], endkey: [toDate], reduce: true, group_level: 8, group: true }; // eslint-disable-line camelcase
  return Promise.all([
    selectWithView(channel, viewUrl, option),
    acquirerRepo.findAllAcquirers()
  ]).then((res) => {
    const transList = _.concat(res[1], mapKeyValue(res[0]));
    const groupList = groupByFields(transList, 'shortCode,paymentMethod,status', body.query);
    let transactions = [];
    for (const prop in groupList) {
      transactions.push(Object.assign(_.get(groupList[prop], 'group[0]', {}), { totalAmount: _.get(groupList[prop], 'totalAmount', 0), transCount: _.get(groupList[prop], 'totalCount', 0) }));
    }
    transactions = _.sortBy(transactions, [(transaction) => transaction.shortCode.toLowerCase(), (transaction) => transaction.paymentMethod.toLowerCase()]);
    const templateTrans = [];
    let gTotal = 0;
    let gCount = 0;
    for (let i = 0; i < transactions.length; i += 1) {
      transactions[i].acquirerName = transactions[i].acquirerName || 'Other';
      templateTrans.push(Object.assign({}, transactions[i]));
      templateTrans[i].shortCode = _.get(transactions[(i - 1)], 'shortCode') === transactions[i].shortCode ? '' : `${transactions[i].shortCode} - ${transactions[i].acquirerName }`;
      templateTrans[i].shortCodeUpperLine = templateTrans[i].shortCode === '' ? 'no-upper-line' : 'upper-line';
      templateTrans[i].paymentMethod = _.get(transactions[(i - 1)], 'paymentMethod') === transactions[i].paymentMethod && _.get(transactions[(i - 1)], 'shortCode') === transactions[i].shortCode ? '' : transactions[i].paymentMethod;
      templateTrans[i].paymentMethodUpperLine = templateTrans[i].paymentMethod === '' ? 'no-upper-line' : 'upper-line';
      gTotal += templateTrans[i].totalAmount;
      gCount += templateTrans[i].transCount;
      templateTrans[i].transCount = countFormat(templateTrans[i].transCount);
      templateTrans[i].totalAmount = amountFormat(templateTrans[i].totalAmount);
    }

    return {
      totalTransactions: res.length,
      criteria: body.criteria,
      couchData: templateTrans,
      content: body.content,
      total: { amount: amountFormat(gTotal), count: gCount }
    };
  });

  function groupByFields(list, properties, query) {
    query['data.CardType'] = query['data.CardType'] || {};
    query['data.PaymentMethod'] = query['data.PaymentMethod'] || {};
    query['data.PaymentGateway'] = query['data.PaymentGateway'] || {};
    query['data.Status'] = query['data.Status'] || {};
    query['data.SPCode'] = query['data.SPCode'] || {};
    query['data.ServiceCode'] = query['data.ServiceCode'] || {};

    const cardType = query['data.CardType'].$in || [];
    const paymentMethod = query['data.PaymentMethod'].$in || [];
    const paymentGateway = query['data.PaymentGateway'].$in || [];
    const spCode = query['data.SPCode'].$in || [];
    const status = query['data.Status'].$in || [];
    const serviceCode = query['data.ServiceCode'].$in || [];

    return list.reduce(function(groups, item) {
      const props = properties.split(',');
      let val = '';
      for (const prop of props) {
        item[prop] = item[prop] || 'Other';
        val += item[prop];
      }
      if (serviceCode.length && serviceCode.indexOf(item.serviceCode) < 0) {
        return groups;
      }
      if (spCode.length && spCode.indexOf(item.spCode) < 0) {
        return groups;
      }
      if (cardType.length && cardType.indexOf(item.cardType) < 0) {
        return groups;
      }
      if (paymentMethod.length && paymentMethod.indexOf(item.paymentMethod) < 0) {
        return groups;
      }
      if (paymentGateway.length && paymentGateway.indexOf(item.paymentGateway) < 0) {
        return groups;
      }
      if (status.length && status.indexOf(item.status) < 0) {
        return groups;
      }
      groups[val] = groups[val] || {};
      item.count = item.count || 0;
      item.amount = item.amount || 0;
      groups[val].totalCount = groups[val].totalCount || 0;
      groups[val].totalAmount = groups[val].totalAmount || 0;
      groups[val].totalAmount += item.amount;
      groups[val].totalCount += item.count;
      groups[val].group = groups[val].group || [];
      groups[val].group.push(item);
      return groups;
    }, {});
  }

  function mapKeyValue(list) {
    return _.map(list, (item) => {
      return {
        count: _.get(item, 'value.count', 0),
        amount: _.get(item, 'value.amount', 0),
        spCode: _.get(item, 'key[1]', ''),
        serviceCode: _.get(item, 'key[2]', ''),
        status: _.get(item, 'key[3]', ''),
        shortCode: _.get(item, 'key[4]', ''),
        paymentGateway: _.get(item, 'key[5]', ''),
        paymentMethod: _.get(item, 'key[6]', ''),
        cardType: _.get(item, 'key[7]', '')
      };
    });
  }
}

module.exports = bankReconStatus;
