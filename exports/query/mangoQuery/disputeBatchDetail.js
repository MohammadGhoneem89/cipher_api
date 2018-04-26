'use strict';

const logger = require('../../../lib/helpers/logger')();
const projection = require('../projection');
const selectPaginated = require('../../../lib/couch/selectPaginated');
const selectCount = require('../../../lib/couch/selectCount');
const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

function disputeBatchDetail(body) {

  logger.app.info(body, ' [ Dispute Batch Search ] Dispute Batch Search req : ');

  let criteria = [];
  let gte = {};
  let lte = {};
  if (body) {
  
    
    if (body.data.fromDate && body.data.fromDate != '') {
      let startDate = body.data.fromDate;
      startDate = date.ddMMyyyyFromDate(startDate) / 1000;
      criteria.push({ 'data.TimeStamp': { $gte: startDate } });

    }
    if (body.data.toDate && body.data.toDate != '') {
      let endDate = body.data.toDate;
      endDate = date.ddMMyyyyToDate(endDate) / 1000;
      criteria.push({ 'data.TimeStamp': { $lte: endDate } });

    }
	if (body.data.pgRefNo && body.data.pgRefNo !== '') {
      criteria.push({ 'data.PGRefNumber': body.data.pgRefNo });
    }
    if (body.data.sPRefNo && body.data.sPRefNo !== '') {
      criteria.push({ 'data.BillerRefNo': body.data.sPRefNo });
    }
    if (body.data.degRefNo && body.data.degRefNo !== '') {
      criteria.push({ 'data.PayRef': body.data.degRefNo });
    }

    if (body.data.batchNo && body.data.batchNo !== '') {
      criteria.push({ 'data.DisputeBatchID': body.data.batchNo });
    }
    if (body.data.entity && body.data.entity !== '') {
      criteria.push({ 'data.SPCode': body.data.SPCode });
    }
    else if (body.data.status && body.data.status !== '') {
      criteria.push({ 'data.Status': body.data.status });
    }

    criteria.push({ 'data.DocumentName': 'DisputeView' })
  }
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
	    logger.app.error(err, ' [ Dispute Batch Search ] Dispute Batch Search Error : ');
    });
}

module.exports = disputeBatchDetail;
