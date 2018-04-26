'use strict';

const selectWithView = require('../../lib/couch/selectWithView');
const _ = require('lodash');
const dates = require('../../lib/helpers/dates');
const amountFormat = require('../../lib/helpers/amountFormat');
const countFormat = require('../../lib/helpers/countFormat');

function costAnalysis(body) {
    const viewUrl = '_design/getCostingReport/_view/getCostingReport';
    const channel = 'transactions';
    body = body || {};
    body.query = body.query || {};
    body.query['data.TimeStamp'] = body.query['data.TimeStamp'] || {};
    const fromDate = body.query['data.TimeStamp'].$gte || 0;
    const toDate = body.query['data.TimeStamp'].$lte || dates.newDate() / 1000;
    const option = { startkey: [fromDate], endkey: [toDate], reduce: true, group_level: 2, group: true }; // eslint-disable-line camelcase
    return selectWithView(channel, viewUrl, option).then((res) => {
        const transList = mapKeyValue(res);
        const groupList = groupByFields(transList, 'spCode', body.query);
        let transactions = [];
        for (const prop in groupList) {
            transactions.push(Object.assign(_.get(groupList[prop], 'group[0]', {})));
        }
        const templateTrans = [];
        let total = {transactions: 0, amount : 0 , entityCommission : 0 , netAmount : 0 , acquirerCommission : 0 , cost : 0};
        for (let i = 0; i < transactions.length; i += 1) {
            templateTrans.push(Object.assign({}, transactions[i]));
            templateTrans[i].totalNetAmount = templateTrans[i].totalAmount - templateTrans[i].totalEntityCommission;
            templateTrans[i].costOfGov = templateTrans[i].totalEntityCommission - templateTrans[i].totalAcquierComission;
            total.transactions +=  templateTrans[i].totalTrans;
            total.amount +=  templateTrans[i].totalAmount;
            total.entityCommission +=  templateTrans[i].totalEntityCommission;
            total.netAmount +=  templateTrans[i].totalNetAmount;
            total.acquirerCommission +=  transactions[i].totalAcquierComission;
            total.cost +=  templateTrans[i].costOfGov;
            templateTrans[i].transCount = countFormat(templateTrans[i].transCount);
            templateTrans[i].totalEntityCommission = amountFormat(templateTrans[i].totalEntityCommission);
            templateTrans[i].totalNetAmount = amountFormat(templateTrans[i].totalNetAmount);
            templateTrans[i].totalAcquierComission = amountFormat(templateTrans[i].totalAcquierComission);
            templateTrans[i].totalAmount = amountFormat(templateTrans[i].totalAmount);
            templateTrans[i].costOfGov = amountFormat(templateTrans[i].costOfGov);
        }
        total.entityCommission = amountFormat(total.entityCommission);
        total.acquirerCommission = amountFormat(total.acquirerCommission);
        total.netAmount = amountFormat(total.netAmount);
        total.amount = amountFormat(total.amount);
        total.cost = amountFormat(total.cost);
        return {
            totalTransactions: res.length,
            criteria: body.criteria,
            couchData: { transactions: templateTrans },
            content: body.content,
            total: total
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
                totalTrans: _.get(item, 'value.totalTrans', 0),
                totalAmount: _.get(item, 'value.totalAmount', 0),
                totalEntityCommission: _.get(item, 'value.totalEntityCommission', 0),
                totalAcquierComission: _.get(item, 'value.totalAcquierComission', 0),
                spCode: _.get(item, 'key[1]', '')
            };
        });
    }
}

module.exports = costAnalysis;
