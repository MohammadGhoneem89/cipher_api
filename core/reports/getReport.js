'use strict';

const reportsCriteriaRepo = require('../lib/repositories/reportsCriteria');
const matching = require('../lib/helpers/criteriaMatching');
const funcPath = require('./functionPath.json');
const criteriaLength = require('../lib/helpers/criteriaLength');
const typeDataRepo = require('../lib/repositories/typeData');
const _ = require('lodash');

function getReport(body) {
  const reportData = {};
    return Promise.all([
      reportsCriteriaRepo.findOne(body.reportsCriteriaId),
      typeDataRepo.getValues("Contract_Status",_.get(body, 'filters.contractStatus', [])),
      typeDataRepo.getValues("InstrumentType",_.get(body, 'filters.paymentMethod', [])),
      typeDataRepo.getValues("Instrument_Status",_.get(body, 'filters.instrumentStatus', []))
  ]).then((res) => {
    body.filters.contractStatusValues = res[1];
    body.filters.paymentMethodValues = res[2];
    body.filters.instrumentStatusValues = res[3];
    const data = res[0];
    reportData.reportName = data.reportName;
    reportData.documentName = data.documentName;
    reportData.content = data.content;
    reportData.projection = data.projection;
    reportData.query = matching(data.filters, body.filters);
    reportData.channel = data.channelName;
    reportData.criteria = criteriaLength(body.filters);
    reportData.JWT = body.JWT;
    const func = require(funcPath[data.content.functionName]);
    return func(reportData);
  });
}

module.exports = getReport;
