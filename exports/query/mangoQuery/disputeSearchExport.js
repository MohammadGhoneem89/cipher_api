'use strict';

const logger = require('../../../lib/helpers/logger')();
//const projection = require('../projection');
//const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');
const datafunc = require('./disputeSearch');

function disputeSearchExport(body,JWToken) {
    logger.app.info(' [ refund Batch Transactions ] refund Batch Transactions req', body);
    if (JWToken.orgType && (JWToken.orgType == 'Entity' || JWToken.orgType == 'Acquirer')) {
        if (JWToken.orgType == 'Entity') {
            body.entity = JWToken.orgCode;
        }
        if (JWToken.orgType == 'Acquirer') {
            body.processor = JWToken.orgCode;
        }
    }
    body = body || {};
    body.currentPageNo = 1;
    body.pageSize = 10000000;

    let format = [];
    return datafunc(body)
        .then((disputeData) => {
            for (let i of disputeData.data) {
                format.push({
                    "entity": i.data.SPCode,
                    "acquirer": i.data.AcquirerId,
                    "disputeRef": i.data.DisputeRef,
                    "ePayRefNo": i.data.PayRef,
                    "spRefNo": i.data.BillerRefNo,
                    "pgRefNo": i.data.PGRefNumber,
                    "date": date.MSddMMyyyyHHmmSS(i.data.DISPUTEINITTS * 1000),
                    "status": i.data.Status
                })
            }
            return format;
        });
}

module.exports = disputeSearchExport;
