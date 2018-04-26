'use strict';

const logger = require('../../../lib/helpers/logger')();
//const projection = require('../projection');
//const select = require('../../../lib/couch/select');
const date = require('../../../lib/helpers/dates');
const findExceptionType = require('../../../lib/helpers/findExceptionType');
const channels = require('../../../lib/constants/channels');
const datafunc = require('./transactionSearchEx');
const amountFormat = require('../../../lib/helpers/amountFormat');

function exceptionForXML(body,JWToken) {

  logger.app.info(' [ Exception Export ] Exception For XML req', body );
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
    body.type = "exception"
  }
  let format = { spCode: "", serviceCode : "",  lineItems: []};
  return datafunc(body)
      .then((exceptionData) => {
        let bDo = true; 
        for(let i of exceptionData.data){
          if (bDo){
             bDo = false;
             format.spCode =  i.data.SPCode;
             format.serviceCode = i.data.ServiceCode;
          }
          format.lineItems.push({
            'ePayRefNo': i.data.PayRef,
            'SPRefNo': i.data.BillerRefNo,
            'PaymentMethod': i.data.PaymentMethod,
            'TransactionDate': date.MSddMMyyyyHHmmS(i.data.TransactionCaptureDate * 1000),
            'Amount': i.data.TotalBillAmount
          });
        }
        return format;
      });
}

module.exports = exceptionForXML;
