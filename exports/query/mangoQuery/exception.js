'use strict';

const logger = require('../../../lib/helpers/logger')();
//const projection = require('../projection');
//const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const findExceptionType = require('../../../lib/helpers/findExceptionType');
const channels = require('../../../lib/constants/channels');
const datafunc = require('./transactionSearchEx');
const amountFormat = require('../../../lib/helpers/amountFormat');

function exception(body,JWToken) {

  logger.app.info(' [ Exception Export ] Exception Export req', body );
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
    body.currentPageNo = 1;
    body.pageSize = 1000000;
    body.data = body;
    body.type = "exception";
  }
  let format = [];
  return datafunc(body)
      .then((exceptionData) => {
        for(let i of exceptionData.data){
          format.push({
            'Entity': i.data.SPCode,
            'Processor': i.data.AcquirerId,
            'ePayRefNo': i.data.PayRef,
            'SPRefNo': i.data.BillerRefNo,
            'PGRefNo': i.data.PGRefNumber,
            'Service': i.data.ServiceCode,
            'TransactionDate': date.MSddMMyyyyHHmmSS(i.data.TransactionCaptureDate * 1000),
            'ExceptionType': findExceptionType(i.data.ISATHR, i.data.ISAUTH, i.data.ISFAIL, i.data.ISINIT, i.data.ISRECN, i.data.ISRECV),
            'Amount': amountFormat(i.data.TotalBillAmount)
          });
        }
        return format;
      });
}

module.exports = exception;
