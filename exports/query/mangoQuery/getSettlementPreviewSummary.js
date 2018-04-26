'use strict';

const logger = require('../../../lib/helpers/logger')();
const selectPaginated = require('../../../lib/couch/selectPaginated');
const selectCount = require('../../../lib/couch/selectCount');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

const selectWithView = require('../../../lib/couch/selectWithView');
const _ = require('lodash');
const dates = require('../../../lib/helpers/dates');
const aF = require('../../../lib/helpers/amountFormat');
const config = require('../../../AppConfig.json');



function getSettlementPreviewSummary(body) {

  logger.app.info(body, ' [ Settlement Preview ] Settlement Preview : ');

 
  const promises = [];
  let SPCode = body.data.SPCode + "a";  //end key should have an extra character

  const viewUrl = '_design/previewSettlementSummary/_view/previewSettlementSummary';
  const option2 = { startkey: [body.data.SPCode], endkey: [SPCode], reduce: true, group_level: 2 };
  
  promises.push(selectWithView(channels.transactions, viewUrl, option2));
 
  return Promise.all(promises)
    .then((responses) => {
      const res0 = responses[0];
      return res0 ;
    })
    .catch((err) => {
      logger.app.error(err, ' [ getSettlementPreviewSummary Error] getSettlementPreviewSummary : ');
    });

    
}

module.exports = getSettlementPreviewSummary;
