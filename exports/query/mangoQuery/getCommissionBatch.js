'use strict';

const logger = require('../../../lib/helpers/logger')();
const selectPaginated = require('../../../lib/couch/selectPaginated');
const selectCount = require('../../../lib/couch/selectCount');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

const selectWithView = require('../../../lib/couch/selectWithView');
const _ = require('lodash');
const dates = require('../../../lib/helpers/dates');
const acquirerRepo = require('../../../lib/repositories/acquirer');
const aF = require('../../../lib/helpers/amountFormat');
const config = require('../../../AppConfig.json');



function getCommmissionBatch(body) {

  logger.app.info(body, ' [ CommissionBatch ] CommissionBatch Search req : ');


 
  let criteria = [];
  if (body) {

    if (body.data.batchID !== '') {
      criteria.push({ 'data.CommissionBatchNo': body.data.batchID });
    }
    criteria.push({ 'data.DocumentName': 'Commission' });
  }
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };


  const option = {
    limit: 1
  };

  const promises = [];
  let batchID = body.data.batchID + "a";  //end key should have an extra character

  const viewUrl = '_design/getCommissionBatchPaymentSummary/_view/getCommissionBatchPaymentSummary';
  const option2 = { startkey: [body.data.batchID], endkey: [batchID], reduce: true, group_level: 3 };
  
  promises.push(selectPaginated(channels.transactions, criteria, [], option));
  promises.push(selectWithView(channels.transactions, viewUrl, option2));
  promises.push(acquirerRepo.find({"shortCode":body.data.shortCode},{}));

     let total = {count: 0, amount:0};
  return Promise.all(promises)
    .then((responses) => {
      const res0 = responses[0].data.docs;
      const res1 = responses[1];
      const res2 = responses[2];

      let d = dates.MSddMMyyyy(_.get(res0, '[0].data.APRVTimestamp', 0) * 1000);
      total.amount = aF(total.amount);
      let paymentWise =  mapKeyValue(res1);
      
      let json = {
           letterFrm : config.CommissionLetter.letterFrm,
           addressedTo : config.CommissionLetter.addressedTo,
           directorName : config.CommissionLetter.directorName,
           batchID : body.data.batchID,
           letterDate : d,
           acquirerNameAR : _.get(res2, '[0].arabicName', ''),
           IBANNumber : _.get(res2, '[0].accounting.GISAccountNo', ''),
           bankName : "",
           branchName : "",
           totalAmount : aF(_.get(res0, '[0].data.ReconciledAmount', 0) + _.get(res0, '[0].data.ExceptionAmount', 0) - _.get(res0, '[0].data.RefundAmount', 0)),
           startDate : dates.MSddMMyyyy(_.get(res0, '[0].data.StartDate', 0) * 1000),
           endDate : dates.MSddMMyyyy(_.get(res0, '[0].data.EndDate', 0) * 1000),
           lineItem : [],
           paymentMethodWise : paymentWise,
          total: total
      };

      
      json.lineItem.push({serviceName : "Refunds", amount : aF(_.get(res0, '[0].data.RefundAmount', 0))});
      
      
      
      return json;
    })
    .catch((err) => {
      logger.app.error(err, ' [ getCommissionBatch Error] CommissionBatch error : ');
    });

    function mapKeyValue(list) {
        return _.map(list, (item) => {
            total.amount += _.get(item, 'value.amount', 0);
            total.count += _.get(item, 'value.count', 0);
            return {
                count: _.get(item, 'value.count', 0),
                amount: aF(_.get(item, 'value.amount', 0)),
                paymentCard: _.get(item, 'key[1]', ''),
                paymentMethod: _.get(item, 'key[2]', '')
            };
        });
    }
}

module.exports = getCommmissionBatch;
