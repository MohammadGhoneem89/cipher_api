'use strict';

const find = require('../../lib/couch/find');
const _ = require('lodash');
const date = require('../../lib/helpers/dates');
const amountFormat = require('../../lib/helpers/amountFormat');

function entitySettlementReport(body) {
  body.query = !_.isEmpty(body.query) ? body.query : { data: { $exists: true } };
  body.query = _.merge({ 'data.DocumentName': body.documentName }, body.query);
  return find(body.channel, body.query, body.projection)
    .then((res) => {
        let format = [];
        res = res || {};
        res =_.orderBy(res, 'data.APRVTimestamp', 'desc') || _.orderBy(res, 'data.INITTimestamp', 'desc');
        for(let i of res){
          format.push({
            "entityName" : i.data.SPCode,
            "settlementDate" : i.data.APRVTimestamp === 0 ? date.MSddMMyyyyHHmmSS(i.data.INITTimestamp * 1000) :  date.MSddMMyyyyHHmmSS(i.data.APRVTimestamp * 1000),
            "totalGrossAmount" : amountFormat(i.data.ReconciledAmount  + i.data.ExceptionAmount),
            "commission" : amountFormat(i.data.TotalCommission - i.data.RefundCommission) ,
            "refunds" : amountFormat(i.data.RefundAmount),
            "netSettlement" :  amountFormat(i.data.ReconciledAmount  + i.data.ExceptionAmount - i.data.RefundAmount - i.data.TotalCommission + i.data.RefundCommission),
            "settlementStatus" : i.data.Status  || "N/A",
            "initiatedBy" : i.data.INITBy  || "N/A",
            "approvedBy" : i.data.APRVBy ,
            "transferDate" : i.data.DEBTTimestamp === 0 ? "" : date.MSddMMyyyyHHmmSS(i.data.DEBTTimestamp / 1000),
            "transferStatus" : i.data.ISDEBT === true ? "transfered" : "Not transfered"  || "N/A",
            "batchID" : i.data.BatchID  || "-"
          });
        }
      return {
        criteria: body.criteria,
        couchData: format,
        content: body.content
      };
    });
}

module.exports = entitySettlementReport;
