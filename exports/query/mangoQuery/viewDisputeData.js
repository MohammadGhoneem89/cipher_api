'use strict';

const logger = require('../../../lib/helpers/logger')();
const projection = require('../projection');
const selectPaginated = require('../../../lib/couch/selectPaginated');
const selectCount = require('../../../lib/couch/selectCount');
const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

function getDisputeData(body) {

  logger.app.info(body, ' [ Dispute Data ] Dispute Data req : ');

  let criteria = [];
  if (body) {
    
    if (body.data.transactionID && body.data.transactionID !== '') {
      criteria.push({ 'data.DisputeRef': body.data.transactionID });
    }
    

    criteria.push({ 'data.DocumentName': 'DisputeView' })
  }
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };



  let pageNo = body.currentPageNo ? body.currentPageNo : 1;
  let pageSize = body.pageSize ? body.pageSize : 10;
  let skip = (pageNo - 1) * pageSize;

  const format = [];

  let option = {
    limit: pageSize,
    skip: skip
  };

  let promises = [];

  promises.push(selectCount(channels.transactions, criteria, ["data.disputeRef"]));
  promises.push(selectPaginated(channels.transactions, criteria, [], option));

  return Promise.all(promises)
    .then((responses) => {
      //console.log(JSON.stringify(responses[0]));
      let res0 = responses[0];
      let res1 = responses[1];

      let resp = {
        count: res0.data.docs.length,
        data: res1.data.docs
      };

      return resp;

    })
    .catch((err) => {
	    logger.app.error(err, ' [ Dispute Data ] Dispute Data error : ');
    });
}

module.exports = getDisputeData;
