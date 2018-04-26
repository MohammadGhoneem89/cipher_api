'use strict';

const find = require('../../lib/couch/find');
const _ = require('lodash');
const dates = require('../../lib/helpers/dates');
const entityRepo = require('../../lib/repositories/entity');
const amountFormat = require('../../lib/helpers/amountFormat');
const countFormat = require('../../lib/helpers/countFormat');

function refundReport(body) {
    body.criteria = body.criteria || {};
    body.query = !_.isEmpty(body.query) ? body.query : {data: {$exists: true}};
    body.query = _.merge({'data.DocumentName': body.documentName}, body.query);
    return Promise.all([
        find(body.channel, body.query, body.projection),
        entityRepo.findAllServiceCodes1()
    ])
        .then((res) => {
            res = res || {};
            let transactions = _.map(res[0], 'data');
            transactions = _.orderBy(transactions, 'data.REFUNDINITTS', 'desc');
            const entities = res[1];
            transactions = _.sortBy(transactions, [(transaction) => transaction.SPCode.toLowerCase(), (transaction) => transaction.ServiceCode.toLowerCase(), 'TimeStamp']);

            let totalAmount = 0;
            for (const transaction of transactions) {
                transaction.TimeStamp = transaction.TimeStamp ? dates.MSddMMyyyy(transaction.TimeStamp * 1000) : '-';
                transaction.REFUNDINITTS = transaction.REFUNDINITTS ? dates.MSddMMyyyy(transaction.REFUNDINITTS * 1000) : '-';
                let spName = _.find(entities, {spCode: transaction.SPCode});
                spName = _.get(spName, 'entityName', '');
                transaction.SPCode = `${transaction.SPCode} - ${spName}`;
                let service = _.find(entities, {serviceCode: transaction.ServiceCode});
                service = _.get(service, 'serviceName', '');
                transaction.ServiceCode = `${transaction.ServiceCode} - ${service}`;
                totalAmount += transaction.TotalBillAmount;
                transaction.TotalBillAmount = amountFormat(transaction.TotalBillAmount);
            }

            return {
                total: {count: countFormat(transactions.length), amount: amountFormat(totalAmount)},
                totalAmount: totalAmount,
                criteria: body.criteria,
                couchData: transactions,
                content: body.content
            };

        });
}

module.exports = refundReport;
