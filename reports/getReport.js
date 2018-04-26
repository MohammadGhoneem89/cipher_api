'use strict';

const reportsCriteriaRepo = require('../lib/repositories/reportsCriteria');
const matching = require('../lib/helpers/criteriaMatching');
const funcPath = require('./functionPath.json');
const criteriaLength = require('../lib/helpers/criteriaLength');
const typeDataRepo = require('../lib/repositories/typeData');

function getReport(body) {
  const reportData = {};
  const promise = [];

  promise.push(reportsCriteriaRepo.findOne(body.reportsCriteriaId));
  if (body.filters.paymentGateway) {
    promise.push(typeDataRepo.getValues('Payment_Gateway', body.filters.paymentGateway));
  }
  if (body.filters.reconStatus) {
    promise.push(typeDataRepo.getValues('Tran_Status_Filters', body.filters.reconStatus));
  }
  return Promise.all(promise).then((res) => {
    const data = res[0];
    body.filters.paymentGatewayValues = res[1];
    body.filters.reconStatusValues = res[2];
    reportData.reportName = data.reportName;
    reportData.documentName = data.documentName;
    reportData.content = data.content;
    reportData.projection = data.projection;
    reportData.query = matching(data.filters, body.filters);
    reportData.channel = data.channelName;
    reportData.criteria = criteriaLength(body.filters);
    const func = require(funcPath[data.reportName]);
    return func(reportData);
  });
}

module.exports = getReport;
