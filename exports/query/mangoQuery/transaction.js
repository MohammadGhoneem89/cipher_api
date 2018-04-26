'use strict';

const logger = require('../../../lib/helpers/logger')();
//const projection = require('../projection');
//const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');
const datafunc = require('./transactionSearchEx');
const amountFormat = require('../../../lib/helpers/amountFormat');

function transaction(body, JWToken) {

  logger.app.info(' [ Transactions Export ] Transactions Export req', body );

  if (JWToken.orgType && (JWToken.orgType == 'Entity' || JWToken.orgType == 'Acquirer')) {
    if (JWToken.orgType == 'Entity') {
      body.entity = JWToken.orgCode;
    }
    if (JWToken.orgType == 'Acquirer') {
      body.processor = JWToken.orgCode;
    }
  }

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
            'Entity': i.data.SPCode,
            'Processor': i.data.AcquirerId,
            'ePayRefNo': i.data.PayRef,
            'SPRefNo': i.data.BillerRefNo,
            'PGRefNo': i.data.PGRefNumber,
            'Service': i.data.ServiceCode,
            'TransactionDate': date.MSddMMyyyyHHmmSS(i.data.TransactionCaptureDate * 1000),
            'Status':  i.data.ISException == false ? 'Reconciled' : 'Not Reconciled',
            'Amount': amountFormat(i.data.TotalBillAmount)
          });
        }
        return format;
      });
}

module.exports = transaction;
