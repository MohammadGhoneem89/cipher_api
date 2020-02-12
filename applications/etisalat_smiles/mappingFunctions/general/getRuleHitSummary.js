'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');
const moment = require('moment');

exports.getRuleHitSummary = async function (payload, UUIDKey, route, callback, JWToken) {

  let response = {
    "getRuleHitSummary": {
      "action": "getRuleHitSummary",
      "data": {
        "searchResult": {},
        "message": {
          "status": "OK",
          "errorDescription": "",
          "displayToUser": false
        }
      }
    }
  };

  let queryTotal = `select count(*) as "count" from eid where 1=1  `;

  let queryRecon = `SELECT SUM(CASE WHEN eid."isreconciled" = true THEN 1 ELSE 0 END) as reconciled,
  SUM(CASE WHEN eid."isreconciled" = false and (recon_status is null or recon_status = 300) THEN 1 ELSE 0 END) as exception, 
  SUM(CASE WHEN eid."isreconciled" = false and recon_status = 200 THEN 1 ELSE 0 END) as pending, 
  SUM(CASE WHEN eid."isreconciled" = false and recon_status = 400 THEN 1 ELSE 0 END) as manualcorrect 
  FROM eid 
  WHERE 1=1 `;

  let initiated_pendingNotifications = `SELECT SUM(CASE WHEN eid."notify_status" = 100 THEN 1 ELSE 0 END) as initiated,
  SUM(CASE WHEN eid."notify_status" = 200 THEN 1 ELSE 0 END) as pending 
  FROM eid 
  WHERE 1=1 `

  let queryCorrections = `SELECT COUNT(*) as corrections FROM ruleauditlog ra inner join eid on ra.datastructureid = eid.key left join "NotificationsRule" nr on ra.ruleid = nr.id where ra.correction = 'CORRECTED' and nr.stream = 'EID' `;

  let queryRuleHit = `select "ruleId", count(*) from public.ruleauditlog ra inner join eid on ra.datastructureid = eid.key left outer join public."NotificationsRule" nr on ra.ruleid=nr.id where nr.stream='EID' `;

  let searchCriteria = payload.searchCriteria;
  if (searchCriteria && Object.keys(searchCriteria).length > 0) {
    let { toDate, fromDate, OLT, Region, SubRegion, FDH, eidList } = searchCriteria;
    if (fromDate && toDate) {
      toDate = moment(toDate + ' ' + '23:59', 'MM/DD/YYYY HH:mm');
      fromDate = moment(fromDate, 'MM/DD/YYYY');
      console.log('dates', toDate.isValid());
      console.log('fdates', fromDate.isValid());
      if (fromDate.isValid() && toDate.isValid()) {
        toDate = toDate.format('YYYY-MM-DD HH:mm:ss');
        fromDate = fromDate.format('YYYY-MM-DD HH:mm:ss');
        console.log('dates', toDate);
        console.log('fdates', fromDate);
        queryRecon += ` and "updated_at" between '${fromDate}' and '${toDate}'`;
        initiated_pendingNotifications += ` and "updated_at" between '${fromDate}' and '${toDate}'`;
        queryTotal += ` and "updated_at" between '${fromDate}' and '${toDate}'`;
        queryCorrections += ` and eid."updated_at" between '${fromDate}' and '${toDate}' `;
        queryRuleHit += ` and eid."updated_at" between '${fromDate}' and '${toDate}' `;
      }
      else {
        response.getRuleHitSummary.data.message.status = 'ERROR';
        response.getRuleHitSummary.data.message.errorDescription = 'Date is not valid';
        response.getRuleHitSummary.data.message.displayToUser = true;
        return callback(response);
      }
    }

    if (OLT) {
      queryRecon += ` and "olt_code_gis" = '${OLT}'`;
      initiated_pendingNotifications += ` and "olt_code_gis" = '${OLT}'`;
      queryTotal += ` and "olt_code_gis" = '${OLT}'`;
      queryCorrections += ` and eid."olt_code_gis" = '${OLT}'`;
      queryRuleHit += ` and eid."olt_code_gis" = '${OLT}'`;
    }
    if (FDH) {
      queryRecon += ` and "fdh_number_gis" = '${FDH}'`;
      initiated_pendingNotifications += ` and "fdh_number_gis" = '${FDH}'`;
      queryTotal += ` and "fdh_number_gis" = '${FDH}'`;
      queryCorrections += ` and eid."fdh_number_gis" = '${FDH}'`;
      queryRuleHit += ` and eid."fdh_number_gis" = '${FDH}'`;
    }
    if (Region) {
      queryRecon += ` and "region_code_gis" = '${Region}'`;
      initiated_pendingNotifications += ` and "region_code_gis" = '${Region}'`;
      queryTotal += ` and "region_code_gis" = '${Region}'`;
      queryCorrections += ` and eid."region_code_gis" = '${Region}'`;
      queryRuleHit += ` and eid."region_code_gis" = '${Region}'`;
    }
    if (SubRegion) {
      queryRecon += ` and "sub_region_gis" = '${SubRegion}'`;
      initiated_pendingNotifications += ` and "sub_region_gis" = '${SubRegion}'`;
      queryTotal += ` and "sub_region_gis" = '${SubRegion}'`;
      queryCorrections += ` and eid."sub_region_gis" = '${SubRegion}'`;
      queryRuleHit += ` and eid."sub_region_gis" = '${SubRegion}'`;
    }
    if (eidList && eidList.length) {
      if (!eidList.includes('A')) {
        eidList.map((e, index) => {
          if (index === 0) {
            queryRecon += ` and (`;
            initiated_pendingNotifications += ` and (`;
            queryTotal += ` and (`;
            queryCorrections += ` and (`;
            queryRuleHit += ` and (`;
          } else {
            queryRecon += ` or`;
            initiated_pendingNotifications += ` or`;
            queryTotal += ` or`;
            queryCorrections += ` or`;
            queryRuleHit += ` or`;
          }
          queryRecon += ` "fdh_type_gis" = '${e}'`;
          initiated_pendingNotifications += ` "fdh_type_gis" = '${e}'`;
          queryTotal += ` "fdh_type_gis" = '${e}'`;
          queryCorrections += ` eid."fdh_type_gis" = '${e}'`;
          queryRuleHit += ` eid."fdh_type_gis" = '${e}'`;
        });
        queryRecon += `) `;
        initiated_pendingNotifications += `) `;
        queryTotal += `) `;
        queryCorrections += `) `;
        queryRuleHit += `) `;
      }
    }
    else {
      queryRecon += ` and "fdh_type_gis" = ''`;
      initiated_pendingNotifications += ` and "fdh_type_gis" = ''`;
      queryTotal += ` and "fdh_type_gis" = ''`;
      queryCorrections += ` and eid."fdh_type_gis" = ''`;
      queryRuleHit += ` and eid."fdh_type_gis" = ''`;
    }
  }

  queryRuleHit += ` group by "ruleId"`;

  console.log('queryRecon: ', queryRecon);
  console.log('initiated_pendingNotifications: ', initiated_pendingNotifications);
  console.log('queryTotal: ', queryTotal);
  console.log('queryRuleHit: ', queryRuleHit);
  console.log('queryCorrections: ', queryCorrections);
  try {
    let conn = await pg.connection();
    let [reconResult, initiated_pendingAuditLogsResult, queryTotalResult, queryRuleHitResult, queryCorrectionsResult] = await Promise.all([
      conn.query(queryRecon),
      conn.query(initiated_pendingNotifications),
      conn.query(queryTotal),
      conn.query(queryRuleHit),
      conn.query(queryCorrections)
    ]);

    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    console.log('reconResult: ', reconResult.rows)
    console.log('initiated_pendingAuditLogsResult: ', initiated_pendingAuditLogsResult.rows)
    console.log('queryTotalResult: ', queryTotalResult.rows)
    console.log('queryRuleHitResult: ', queryRuleHitResult.rows)
    console.log('queryCorrectionsResult: ', queryCorrectionsResult.rows)

    response.getRuleHitSummary.data.searchResult = {
      ruleHit: _.get(queryRuleHitResult, 'rows', []),
      total: (_.get(queryTotalResult, 'rows[0].count', 0)),
      pending: _.get(initiated_pendingAuditLogsResult, 'rows[0].pending', 0),
      initiated: _.get(initiated_pendingAuditLogsResult, 'rows[0].initiated', 0),
      recon: _.get(reconResult, 'rows[0]', []),
      corrections: _.get(queryCorrectionsResult, 'rows[0].corrections', 0)
    };
    console.log('response.getRuleHitSummary.data.searchResult', JSON.stringify(response.getRuleHitSummary.data.searchResult, null, 2))
    return callback(response);
  } catch (e) {
    console.log(e);
    callback(e.stack);
  }
};
