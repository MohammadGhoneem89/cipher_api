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
    reportsCriteriaRepo.findOne(body.reportsCriteriaId)
  ]).then((res) => {
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
