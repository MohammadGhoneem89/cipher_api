'use strict';

const logger = require('../../../lib/helpers/logger')();
//const projection = require('../projection');
//const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');
const datafunc = require('./refundBatchSearch');
const amountFormat = require("../../../lib/helpers/amountFormat");

function refundBatch(body,JWToken) {
    logger.app.info(' [ refundedTransactions ] refundedTransactions req', body );
    if (JWToken.orgType && (JWToken.orgType == 'Entity' || JWToken.orgType == 'Acquirer')) {
        if (JWToken.orgType == 'Entity') {
            body.entity = JWToken.orgCode;
        }
        if (JWToken.orgType == 'Acquirer') {
            body.processor = JWToken.orgCode;
        }
    }
    if (body) {
        body.data = body || {};
        body.currentPageNo = "";
        body.pageSize = 1000;
    }
    let format = [];
    return datafunc(body)
        .then((refundBatchData) => {
            for(let i of refundBatchData.data){
                format.push({
                    BatchNo : i.data.RefundBatchNo || "N/A",
                    Processor : i.data.AcquirerId || "N/A",
                    Date : date.MSddMMyyyyHHmmS(i.data.INITTimestamp * 1000) || "N/A",
                    RefundCount : i.data.RefundCount,
                    RefundAmount :  amountFormat(i.data.RefundAmount),
                    Status : i.data.Status || "N/A"
                })
            }
            return format;
        });
}

module.exports = refundBatch;
