'use strict';

const logger = require('../../../lib/helpers/logger')();
const date = require('../../../lib/helpers/dates');
const channels = require('../../../lib/constants/channels');
const datafunc = require('./settlementSearchList');
const amountFormat = require('../../../lib/helpers/amountFormat');

function settlementList(body,JWToken) {

    logger.app.info(' [ Settlement Export ] Settlement Data req', body);
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
    return datafunc(body, JWToken)
        .then((transactionData) => {
          for(let i of transactionData.data){
            format.push({
              'batchNo': i.data.SettlementBatchNo,
              'SPCode': i.data.SPCode,
              'initiatedDate': date.MSddMMyyyyHHmmSS(i.data.INITTimestamp * 1000),
                "net" :  amountFormat((i.data.ReconciledAmount+i.data.ExceptionAmount+i.data.RefundAmount).toFixed(2) - (i.data.TotalCommission-i.data.RefundCommission)),
              'amount' : amountFormat((i.data.ReconciledAmount+i.data.ExceptionAmount+i.data.RefundAmount).toFixed(2)),
              'commission': amountFormat(i.data.TotalCommission-i.data.RefundCommission),
              'status': i.data.Status              
            });
          }
          return format;
        });
}

module.exports = settlementList;
