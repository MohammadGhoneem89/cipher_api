'use strict';

const logger = require('../../../lib/helpers/logger')();
//const projection = require('../projection');
//const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');
const datafunc = require('./refundSearch');

function refundedTransactions(body,JWToken) {

    logger.app.info(' [ Refunded Transactions ] refundedTransactions req', body );
    if (JWToken.orgType && (JWToken.orgType == 'Entity' || JWToken.orgType == 'Acquirer')) {
        if (JWToken.orgType == 'Entity') {
            body.entity = JWToken.orgCode;
        }
        if (JWToken.orgType == 'Acquirer') {
            body.processor = JWToken.orgCode;
        }
    }
    if (body) {
        body = body || {};
        body.currentPageNo = "";
        body.pageSize = 100000;
    }
    let format = [];
        return datafunc(body)
        .then((refundTransactionsData) => {
            for(let i of refundTransactionsData.data){
                format.push({
                    Entity : i.data.SPCode || "N/A",
                    Acquirer : i.data.AcquirerId || "N/A",
                    RefundRefNo : i.data.RefundRef || "N/A",
                    ePayRefNo : i.data.PayRef || "N/A",
                    SPRefNo : i.data.BillerRefNo || "N/A",
                    PGRefNo : i.data.PGRefNumber || "N/A",
                    Date : date.MSddMMyyyyHHmmS(i.data.REFUNDINITTS * 1000)  || "N/A",
                    Status : i.data.Status || "N/A"
                })
            }
            return format;
        });
}

module.exports = refundedTransactions;
