'use strict';

const logger = require('../../../lib/helpers/logger')();
const projection = require('../projection');
const selectPaginated = require('../../../lib/couch/selectPaginated');
const selectCount = require('../../../lib/couch/selectCount');
const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

function disputeBatchSearch(body) {

  logger.app.info(body, ' [ Dispute Batch Search ] Dispute Batch Search req : ');

  let criteria = [];
  let gte = {};
  let lte = {};
  if (body) {

    if (body.data.fromDate && body.data.fromDate != '') {
      let startDate = body.data.fromDate;
      startDate = date.ddMMyyyyFromDate(startDate) / 1000;
      criteria.push({ 'data.INITTimestamp': { $gte: startDate } });
    }
    if (body.data.toDate && body.data.toDate != '') {
      let endDate = body.data.toDate;
      endDate = date.ddMMyyyyToDate(endDate) / 1000;
      criteria.push({ 'data.INITTimestamp': { $lte: endDate } });
    }
    if (body.data.batchNo && body.data.batchNo !== '') {
      criteria.push({ 'data.DisputeBatchNo': body.data.batchNo });
    }
    if (body.data.entity && body.data.entity !== '') {
      criteria.push({ 'data.AcquirerId': body.data.entity });
    }
    if (body.data.status && body.data.status !== '') {
      criteria.push({ 'data.Status': body.data.status });
    }
  }
  criteria.push({ 'data.DocumentName': 'DisputeBatchView' });
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };



  let pageNo = body.currentPageNo ? body.currentPageNo : 1;
  let pageSize = body.pageSize ? body.pageSize : 10;
  let skip = (pageNo - 1) * pageSize

  const format = [];



  let option = {
    limit: pageSize,
    skip: skip
  }

  let promises = [];

  promises.push(selectCount(channels.transactions, criteria, ["data.DisputeRef"]));
  promises.push(selectPaginated(channels.transactions, criteria, [], option));

  return Promise.all(promises)
    .then((responses) => {
      //console.log(JSON.stringify(responses[0]));
      let res0 = responses[0];
      let res1 = responses[1];

      let resp = {
        count: res0.data.docs.length,
        data: res1.data.docs
      }

      return resp;

    })
    .catch((err) => {
	    logger.app.info(err, ' [ Dispute Batch Search ] Dispute Batch Search error : ');
    });
}

module.exports = disputeBatchSearch;
