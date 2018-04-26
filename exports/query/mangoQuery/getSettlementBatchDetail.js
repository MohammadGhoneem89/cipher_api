'use strict';

const logger = require('../../../lib/helpers/logger')();
const selectPaginated = require('../../../lib/couch/selectPaginated');
const selectCount = require('../../../lib/couch/selectCount');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

function getSettlementBatchDetail(body) {

    logger.app.info(body.data, ' [ Settlement Batch Detail] Settlement Batch Search req : ');

    let criteria = [];
    if (body.data) {

        if (body.data.batchID && body.data.batchID !== '') {
            criteria.push({ 'data.SettlementBatchNo': body.data.batchID });
        }
        criteria.push({ 'data.DocumentName': 'Settlement' });
    }
    criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };



    const pageNo = 1;
    const pageSize =  10;
    const skip = (pageNo - 1) * pageSize;

    const option = {
        limit: pageSize,
        skip: skip
    };

    const promises = [];

    promises.push(selectCount(channels.transactions, criteria, ['data.SettlementBatchNo']));
    promises.push(selectPaginated(channels.transactions, criteria, [], option));

    return Promise.all(promises)
        .then((responses) => {
            const res0 = responses[0];
            let res1 = responses[1];
            let response = res1.data.docs;
           
            return {
                count: res0.data.docs.length,
                data: response
            };
        })
        .catch((err) => {
            logger.app.error(err, ' [ Transaction Search ] transaction Search error : ');
        });
}

module.exports = getSettlementBatchDetail;


