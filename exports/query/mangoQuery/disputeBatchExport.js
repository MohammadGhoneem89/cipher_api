'use strict';

const logger = require('../../../lib/helpers/logger')();
//const projection = require('../projection');
//const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');
const datafunc = require('./disputeBatchSearch');

function disputeBatchExport(body,JWToken) {
    logger.app.info(' [ refund Batch Transactions ] refund Batch Transactions req', body);
    if (JWToken.orgType && (JWToken.orgType == 'Entity' || JWToken.orgType == 'Acquirer')) {
        if (JWToken.orgType == 'Entity') {
            body.entity = JWToken.orgCode;
        }
        if (JWToken.orgType == 'Acquirer') {
            body.processor = JWToken.orgCode;
        }
    }
    if (body) {
        body.currentPageNo = 1;
        body.pageSize = 1000000;
        body.data = body;
    }
    let format = [];
    return datafunc(body)
        .then((disputeData) => {
            for (let i of disputeData.data) {
                format.push({
                    "entity": i.data.AcquirerId,
                    "batchNo": i.data.DisputeBatchNo,
                    "date": date.MSddMMyyyyHHmmS(i.data.INITTimestamp * 1000),
                    "status": i.data.Status
                });
            }
            return format;
        });
}

module.exports = disputeBatchExport;
