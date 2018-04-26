'use strict';

const validator = require('../validator');
const selectWithView = require('../couch/selectWithView');
const datesHelper = require('../helpers/dates');
const _ = require('lodash');

module.exports = {
  getConsolidateView
};

function getConsolidateView(payload) {
  return validator.errorValidate(payload, validator.schemas.transaction.getMonthYear)
    .then(() => {
      const date = {
        Year: datesHelper.roundToYear,
        Month: datesHelper.roundToMonth
      };
      const viewIndex = `${payload.searchCriteria.label}${payload.searchCriteria.type}`;
      const viewUrl = `_design/getTransactionBy/_view/${viewIndex}`;
      let startKey = datesHelper.ddMMyyyyMS(payload.searchCriteria.fromDate);
      let endKey = datesHelper.ddMMyyyyMS(payload.searchCriteria.toDate);
      startKey = date[payload.searchCriteria.type](startKey) / 1000;
      endKey = date[payload.searchCriteria.type](endKey) / 1000;
      const options = { reduce: true, group_level: 2, startkey: [startKey], endkey: [endKey] }; // eslint-disable-line camelcase
      return selectWithView('', viewUrl, options);
    })
    .then((data) => {
      data = mapKeyValue(data);
      data = _.filter(data, (item) => !(payload.searchCriteria.value.length && payload.searchCriteria.value.indexOf(item.value) < 0));
      data = groupByFields(data, 'date');
      const transactions = [];
      for (const prop in data) {
        transactions.push(Object.assign(_.get(data[prop], 'group[0]', {}), { count: _.get(data[prop], 'count', 0), amount: _.get(data[prop], 'amount', 0) }));
      }
      const date = {
        Month: datesHelper.MMYYYY,
        Year: datesHelper.YYYY
      };

      const dates = [];
      const count = [];
      const amount = [];

      for (const tran of transactions) {
        dates.push(tran.date * 1000);
        delete tran.value;
        count.push(tran.count);
        amount.push(Math.floor(tran.amount / 10) / 100);
      }

      const len = 5 - dates.length;
      for (let i = 0; i < len; i += 1) {
        const lastDate = dates[0] || datesHelper.addDate(datesHelper.newDate(), payload.searchCriteria.type, 1);
        dates.unshift(datesHelper.subDate(lastDate, payload.searchCriteria.type, 1));
        count.unshift(0);
        amount.unshift(0.00);
      }

      const formatDate = [];
      for (const dt of dates) {
        formatDate.push(date[payload.searchCriteria.type](dt));
      }

      const response = {
        date: formatDate,
        count: count,
        amount: amount
      };

      return response;
    });

  function mapKeyValue(list) {
    return _.map(list, (item) => {
      return {
        count: _.get(item, 'value.count', 0),
        amount: _.get(item, 'value.amount', 0),
        date: _.get(item, 'key[0]', ''),
        value: _.get(item, 'key[1]', '')
      };
    });
  }

  function groupByFields(list, prop) {
    return list.reduce(function(groups, item) {
      const val = item[prop];
      groups[val] = groups[val] || {};
      groups[val].count = groups[val].count || 0;
      groups[val].amount = groups[val].amount || 0;
      groups[val].amount += item.amount;
      groups[val].count += item.count;
      groups[val].group = groups[val].group || [];
      groups[val].group.push(item);
      return groups;
    }, {});
  }
}
