'use strict';

const logger = require('../../../lib/helpers/logger')();
//const projection = require('../projection');
//const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');
const datafunc = require('./transactionSearchEx');
const amountFormat = require('../../../lib/helpers/amountFormat');

function transaction(body) {

  logger.app.info(' [ Settlement Transaction Export ] req', body );

  body = body || {};
  if (body) {
    body.currentPageNo = "";
    body.pageSize = 1000000;
    body.data = body;
  }

  let format = [];
  return datafunc(body)
      .then((transactionData) => {
        for(let i of transactionData.data){
          format.push({
            'degRefNo': i.data.PayRef,
            'spRefNo': i.data.BillerRefNo,
            'pegRefNo': i.data.PGRefNumber,
            'dgRefNo': i.data.PayRef,
            'pgCode': i.data.AcquirerId,
            'tranDate': date.MSddMMyyyyHHmmSS(i.data.TransactionCaptureDate * 1000),
            'amount' : amountFormat(i.data.TotalBillAmount),
            'tranStatus': i.data.CommissionTranState,
            'blockchainNo': 'N/A',
            'ServiceProvider': i.data.SPCode,            
            'batchID': body.data.commissionBatchID,
            "Service": i.data.ServiceCode,
            
          });
        }
        return format;
      });
}

module.exports = transaction;
