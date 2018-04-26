'use strict';

const find = require('../../lib/couch/find');
const _ = require('lodash');
const dates = require('../../lib/helpers/dates');

function disputeReport(body) {
    body.query = !_.isEmpty(body.query) ? body.query : { data: { $exists: true } };
    body.query = _.merge({ 'data.DocumentName': body.documentName }, body.query);

    return find(body.channel, body.query, body.projection)
        .then((res) => {
            const transactions = _.map(res, 'data');
            let format = [];
            for(const tran of transactions){
                format.push({
                    transDate : dates.MSddMMyyyyHHmmSS(tran.TimeStamp * 1000),
                    spCode : tran.SPCode,
                    service : tran.ServiceCode,
                    amount : tran.TotalBillAmount,
                    degTran : tran.PayRef,
                    disputeNo : tran.DisputeRef,
                    disputeDate : dates.MSddMMyyyyHHmmSS(tran.DISPUTEINITTS),
                    status : tran.Status
                });
            }
            return {
                criteria: body.criteria,
                couchData: format,
                content: body.content,
                total: transactions.length
            };
        });
}

module.exports = disputeReport;
