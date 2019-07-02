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
           from public.ruleauditlog ra left outer join public."NotificationsRule" nr on ra.ruleid=nr.id `;

    if (body) {
      if ((Object.keys(body)).length) {
        queryData += ` where`;
        let entered = false;
        if (body.fromDate && body.toDate) {
          queryData += ` datetime between ${(new Date(body.fromDate).toISOString())} and ${(new Date(body.toDate).toISOString())}`;
          entered = true;
        }
        if (body.ruleName) {
          if (entered) {
            queryData += ` and`;
          }
          queryData += ` rulename like '%${body.ruleName}%'`;
        }
        // if (body.ruleTypes) {
        //   if (entered) {
        //     queryData += ` and`;
        //   }
        //   queryData += ` nr."ruleTypes" = '${body.ruleTypes}'`;
        // }
      }
    }

    queryData += ` group by "ruleId" order by "ruleId"`;
    console.log('queryData', queryData);
    const conn = await pg.connection();
    const data = await conn.query(queryData);
    let result = _.get(data, 'rows', []);
    let response = {
      "getRuleActionLogReport": {
        "action": "getRuleActionLogReport",
        "data": {
          "searchResult": result
        }
      }
    };
    return callback(response);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

