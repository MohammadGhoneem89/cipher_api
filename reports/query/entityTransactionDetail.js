'use strict';

const find = require('../../lib/couch/selectWithProjection');
const _ = require('lodash');
const date = require('../../lib/helpers/dates');
const findStatus = require('../../lib/helpers/findStatus');
const amountFormat = require('../../lib/helpers/amountFormat');
const service = require("../../lib/repositories/entity");

function entityTransactionDetail(body) {

    if (body.JWT.orgType === 'Entity' || body.JWT.orgType === 'entity') {
        body.query = body.query || {};
        body.query['SPCode'] = body.query['SPCode'] || {};
        body.query['SPCode'].$in = body.query['SPCode'].$in || [];
        body.query['SPCode'].$in = [body.JWT.orgCode];
    }

    body.criteria = body.criteria || {};
    body.query = !_.isEmpty(body.query) ? body.query : {data: {$exists: true}};
    body.query = _.merge({'DocumentName': body.documentName}, body.query);

    let option= {
        limit: 100000
    }

    return Promise.all([find(body.channel, body.query, body.projection,option),
        service.findAllServiceCodes1()
    ])
        .then((entityData) => {
            let data = entityData[1];
            let total = 0;
            let res = entityData[0] || [];
            res = _.orderBy(res, 'TimeStamp', 'desc');

            for (let i = 0; i < res.length; i += 1) {
                res[i].TotalBillAmount = res[i].TotalBillAmount || 0;
                res[i].TotalBillAmount = +res[i].TotalBillAmount;
                res[i].ServiceCode = `${_.get(_.find(data,{serviceCode : res[i].ServiceCode}), 'serviceName', 'Other')} - ${_.get(res[i], 'ServiceCode', 'Other')}`;
                res[i].Status = findStatus(res[i].ISRFND, res[i].ISFAIL, res[i].EPayStatusAuthRecv, res[i].EPayStatusRecv);
                res[i].TransactionCaptureDate = date.MSddMMyyyyHHmmSS(_.get(res[i], 'TimeStamp') * 1000);
                res[i].ReconTimestamp = date.MSddMMyyyyHHmmSS(_.get(res[i], 'ReconTimestamp'));
                if (res[i].TotalBillAmount) {
                    total += res[i].TotalBillAmount;
                }
                res[i].SPCode = res[i].SPCode || 'Other';
                res[i].ServiceCode = res[i].ServiceCode || 'Other';
                res[i].TotalBillAmount = amountFormat(_.get(res[i], 'TotalBillAmount'));
            }
            total = _.round(total, 2);
            let transactions = res || [];


            //let transactions = _.map(res, 'data', []);
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

            console.log('====Report generate started at: ' + new Date())
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

