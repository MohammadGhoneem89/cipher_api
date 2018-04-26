'use strict';

const logger = require('../../../lib/helpers/logger')();
const selectPaginated = require('../../../lib/couch/selectPaginated');
const selectCount = require('../../../lib/couch/selectCount');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');

const selectWithView = require('../../../lib/couch/selectWithView');
const _ = require('lodash');
const dates = require('../../../lib/helpers/dates');
const entityRepo = require('../../../lib/repositories/entity');
const aF = require('../../../lib/helpers/amountFormat');
const config = require('../../../AppConfig.json');


function resolveName(key,value){

   for (let j=0;j<value.length;j++){
       if (value[j].serviceCode == key){
          return value[j].serviceName
       }
   }
   return key;
}




function getSettlementBatch(body) {

  logger.app.info(body, ' [ Settlement Batch ] Settlement Batch Search req : ');

  let criteria = [];
  if (body) {

    if (body.data.batchID !== '') {
      criteria.push({ 'data.SettlementBatchNo': body.data.batchID });
    }
    criteria.push({ 'data.DocumentName': 'Settlement' });
  }
  criteria = criteria.length > 0 ? { '$and': criteria } : { data: { $exists: true } };

  const option = {
    limit: 1
  };

  const promises = [];
  let batchID = body.data.batchID + "a";  //end key should have an extra character

  const viewUrl = '_design/getSettlementBatchServiceSummary/_view/getSettlementBatchServiceSummary';
  const option2 = { startkey: [body.data.batchID], endkey: [batchID], reduce: true, group_level: 2 };
  
  const viewUrl2 = '_design/getSettlementBatchPaymentMethodSummary/_view/getSettlementBatchPaymentMethodSummary';
  const option3 = { startkey: [body.data.batchID], endkey: [batchID], reduce: true, group_level: 3 };

  promises.push(selectPaginated(channels.transactions, criteria, [], option));
  promises.push(selectWithView(channels.transactions, viewUrl, option2));
  promises.push(entityRepo.find({"spCode":body.data.entity},{}));
  promises.push(selectWithView(channels.transactions, viewUrl2, option3));
    let total = {count: 0, amount:0};
  return Promise.all(promises)
    .then((responses) => {
      const res0 = responses[0].data.docs;
      const res1 = responses[1];
      const res2 = responses[2];
      const res3 = responses[3];

      let d = dates.MSddMMyyyy(res0[0].data.APRVTimestamp*1000);
          let paymentWise =  mapKeyValue(res3);
          total.amount = aF(total.amount);
      let json = {
           letterFrm : config.SettlementLetter.letterFrm,
           addressedTo : config.SettlementLetter.addressedTo,
           directorName : config.SettlementLetter.directorName,
           batchID : body.data.batchID,
           letterDate : d,
           entityNameAR : res2[0].arabicName,
           IBANNumber : res2[0].accounting.GISAccountNo,
           bankName : "",
           branchName : "",
           totalAmount : aF(res0[0].data.ReconciledAmount + res0[0].data.ExceptionAmount - res0[0].data.RefundAmount),
           startDate : dates.MSddMMyyyy(res0[0].data.StartDate*1000),
           endDate : dates.MSddMMyyyy(res0[0].data.EndDate*1000),
           lineItem : [],
           paymentMethodWise : paymentWise,
          total: total
      };

      for(let i=0;i<res1.length;i++){
         let amt = aF(res1[i].value);
         json.lineItem.push({serviceName : resolveName(res1[i].key[1],res2[0].services), amount :amt });
      }
      

      json.lineItem.push({serviceName : "Refunds", amount : aF(res0[0].data.RefundAmount)});
      json.lineItem.push({serviceName : "Commission", amount : 0});
      

      return json;
    })
    .catch((err) => {
      logger.app.error(err, ' [ getSettlementBatch Error] Settlement Batch error : ');
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

module.exports = getSettlementBatch;
