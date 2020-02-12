'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getRuleActionLogReport = async function (payload, UUIDKey, route, callback, JWToken) {
  try {
    let body;
    if (payload && payload.body && payload.body.searchCriteria) {
      body = payload.body.searchCriteria;
    }
    let queryData = `select "ruleId" as rulename, sum(case when correction=\'INITIATED\' THEN 1 ELSE 0 END) as initiated, 
          sum(case when correction=\'CORRECTED\' THEN 1 ELSE 0 END) resolved, sum(case when correction=\'REJECTED\' THEN 1 ELSE 0 END) rejected,
           sum(case when correction=\'PENDING\' THEN 1 ELSE 0 END) pending 
           from public.ruleauditlog ra left outer join public."NotificationsRule" nr on ra.ruleid=nr.id  `;

    let queryRatio = `SELECT SUM(CASE WHEN CORRECTION = 'CORRECTED' THEN 1 ELSE 0 END) as corrected,
                      SUM(CASE WHEN CORRECTION = 'REJECTED' THEN 1 ELSE 0 END) as rejected
                    FROM ruleauditlog ra left outer join public."NotificationsRule" nr on ra.ruleid=nr.id WHERE 1=1 `;

    if (body) {
      if ((Object.keys(body)).length) {
        queryData += ` where`;
        let entered = false;
        if (body.fromDate && body.toDate) {
          let fromdate = new Date(parseInt(body.fromDate))
          let todate = new Date(parseInt(body.toDate))

          queryData += ` datetime between '${fromdate.getFullYear() + "-" + (fromdate.getMonth() + 1) + "-" + fromdate.getDate() + " 00:00:00"}' and '${todate.getFullYear() + "-" + (todate.getMonth() + 1) + "-" + todate.getDate() + " 23:59:59"}'`;
          entered = true;

          queryRatio += ` AND ra.datetime BETWEEN '${fromdate.getFullYear() + "-" + (fromdate.getMonth() + 1) + "-" + fromdate.getDate() + " 00:00:00"}' AND '${todate.getFullYear() + "-" + (todate.getMonth() + 1) + "-" + todate.getDate() + " 23:59:59"}'`
        }
        if (body.ruleName) {
          if (entered) {
            queryData += ` and`;
          }
          entered = true;
          queryData += ` "ruleId" like '%${body.ruleName}%'`;

          queryRatio += ` AND nr."ruleId" like '%${body.ruleName}%'`;
        }
        if (body.ruleTypes) {
          if (entered) {
            queryData += ` and`;
          }
          entered = true;
          queryData += ` nr."ruleType" = '${body.ruleTypes}'`;

          queryRatio += ` AND nr."ruleType" = '${body.ruleTypes}'`
        }
        if (body.dsType) {
          if (entered) {
            queryData += ` and`;
          }
          entered = true;
          queryData += ` ra."datastructure" = '${body.dsType}'`;
          queryRatio += ` AND ra."datastructure" = '${body.dsType}'`
        }
        if (body.stream) {
          if (entered) {
            queryData += ` and`;
          }
          queryData += ` nr."stream" = '${body.stream}'`;
          queryRatio += ` AND nr."stream" = '${body.stream}'`
        }
      }
    }

    queryData += ` group by "ruleId" order by "ruleId"`;
    console.log('queryRatio', queryData);
    console.log('queryRatio', queryRatio);
    const conn = await pg.connection();
    const data = await conn.query(queryData);
    const ratio = await conn.query(queryRatio);

    let result = _.get(data, 'rows', []);
    let corrected = _.get(ratio, 'rows[0].corrected', 0);
    corrected = corrected ? corrected : 0;
    let rejected = _.get(ratio, 'rows[0].rejected', 0);
    rejected = rejected ? rejected : 0;
    
    let response = {
      "getRuleActionLogReport": {
        "action": "getRuleActionLogReport",
        "data": {
          "searchResult": result,
          "corrected" : corrected,
          "rejected" : rejected
        }
      }
    };
    return callback(response);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

