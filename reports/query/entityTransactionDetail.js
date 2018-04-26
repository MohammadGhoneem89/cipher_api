'use strict';

const find = require('../../lib/couch/find');
const _ = require('lodash');
const date = require('../../lib/helpers/dates');
const findStatus = require('../../lib/helpers/findStatus');
const amountFormat = require('../../lib/helpers/amountFormat');
const service = require("../../lib/repositories/entity");

function entityTransactionDetail(body) {
    body.criteria = body.criteria || {};
    body.query = !_.isEmpty(body.query) ? body.query : {data: {$exists: true}};
    body.query = _.merge({'data.DocumentName': body.documentName}, body.query);

    return Promise.all([find(body.channel, body.query, body.projection),
        service.findAllServiceCodes1()
    ])
        .then((entityData) => {
            let data = entityData[1];
            let total = 0;
            let res = entityData[0] || {};
            res = _.orderBy(res, 'data.TimeStamp', 'desc');
            for (let i = 0; i < res.length; i += 1) {
                res[i].data.ServiceCode = `${_.get(_.find(data,{serviceCode : res[i].data.ServiceCode}), 'serviceName', 'Other')} - ${_.get(res[i], 'data.ServiceCode', 'Other')}`;
                res[i].data.Status = findStatus(res[i].data.ISRFND, res[i].data.ISFAIL, res[i].data.EPayStatusAuthRecv, res[i].data.EPayStatusRecv);
                res[i].data.TransactionCaptureDate = date.MSddMMyyyyHHmmSS(_.get(res[i], 'data.TimeStamp') * 1000);
                res[i].data.ReconTimestamp = date.MSddMMyyyyHHmmSS(_.get(res[i], 'data.ReconTimestamp'));
                if (res[i].data.TotalBillAmount) {
                    total += res[i].data.TotalBillAmount;
                }
                res[i].data.SPCode = res[i].data.SPCode || 'Other';
                res[i].data.ServiceCode = res[i].data.ServiceCode || 'Other';
                res[i].data.TotalBillAmount = amountFormat(_.get(res[i], 'data.TotalBillAmount'));
            }
            total = _.round(total, 2);
            let transactions = _.map(res, 'data', []);
            //transactions = _.sortBy(transactions, [(transaction) => transaction.SPCode.toLowerCase(), (transaction) => transaction.ServiceCode.toLowerCase()]);
            //const templateTrans = [];
            //for (let i = 0; i < transactions.length; i += 1) {
            //  templateTrans.push(Object.assign({}, transactions[i]));
            //  templateTrans[i].SPCode = _.get(transactions[(i - 1)], 'SPCode') === transactions[i].SPCode ? '' : transactions[i].SPCode;
            //  templateTrans[i].spCodeUpperLine = templateTrans[i].SPCode === '' ? 'no-upper-line' : 'upper-line';
            //  templateTrans[i].ServiceCode = _.get(transactions[(i - 1)], 'SPCode') === transactions[i].SPCode && _.get(transactions[(i - 1)], 'ServiceCode') === transactions[i].ServiceCode ? '' : transactions[i].ServiceCode;
            //  templateTrans[i].serviceCodeUpperLine = templateTrans[i].ServiceCode === '' ? 'no-upper-line' : 'upper-line';
            //}
            body.criteria.Entity = body.criteria.Entity || 'N / A';
            body.criteria.fromDate = body.criteria.fromDate || 'N / A';
            body.criteria.paymentGateway = body.criteria.paymentGateway || 'N / A';
            body.criteria.cardType = body.criteria.cardType || 'N / A';
            body.criteria.toDate = body.criteria.toDate || 'N / A';
            body.criteria.reconStatus = body.criteria.reconStatus || 'N / A';
            body.criteria.Acquirer = body.criteria.Acquirer || 'N / A';

            return {
                totalTransactions: res.length,
                criteria: body.criteria,
                couchData: transactions,
                content: body.content,
                total: amountFormat(total)
            };
        })
}

module.exports = entityTransactionDetail;

