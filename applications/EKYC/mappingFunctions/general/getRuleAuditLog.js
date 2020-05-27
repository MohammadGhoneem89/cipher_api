'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getRuleAuditLog = async function (payload, UUIDKey, route, callback, JWToken) {
  console.log(JSON.stringify(payload));
  let body = _.get(payload, 'body', undefined);
  let searchCriteria = false;
  let searchCriteriaData = _.get(body, 'searchCriteria', {});
  if (body && Object.keys(searchCriteriaData).length && Object.keys(searchCriteriaData).length > 0) {
    searchCriteria = true;
  }
  let response = {
    "getRuleAuditLog": {
      "action": "getRuleAuditLog",
      "pageData": {
        "pageSize": 0,
        "currentPageNo": 0,
        "totalRecords": 0
      },
      "data": {
        "searchResult": [],
        message: {
          status: 'OK',
          errorDescription: 'List of Rules Audit Logs',
          displayToUser: false
        }
      }
    }
  };
  try {
    const conn = await pg.connection();
    let sizing = ` ORDER BY r.datetime  DESC LIMIT ${body.pageSize} OFFSET ${((Number(body.pageNumber) - 1) * Number(body.pageSize))};`;
    let totalRecords = `Select * from public."ruleauditlog" r inner join "NotificationsRule" nr  on  nr.id=r.ruleid where 1=1 ` ;
    let query = `Select r.datastructure, r.datastructureid, r.notification, r.correction, r.id as internalid, r.ruleid, date_part('epoch'::text, r.datetime)::bigint as "dateEpoch", nr.* 
        from public."ruleauditlog" r inner join
        "NotificationsRule" nr  on  nr.id=r.ruleid where 1 = 1`;
    console.log(payload.body);
    if (searchCriteria) {
      let whereClause = '';
      if (body && searchCriteriaData.dataStructure) {
        whereClause = ` AND lower("datastructure") = '${searchCriteriaData.dataStructure.toLowerCase()}' `;
      }

      if (body.searchCriteria.ruleName) {
        whereClause += ` AND "ruleId" LIKE '%${searchCriteriaData.ruleName}%'`;
      }

      if (searchCriteriaData.notificationStatus) {
        whereClause += ` AND correction = '${searchCriteriaData.notificationStatus}'`;
      }

      if (searchCriteriaData.stream) {
        whereClause += ` AND stream = '${searchCriteriaData.stream}'`;
      }
      query += ` ${whereClause} ${sizing}`;
      totalRecords += ` ${whereClause} `

    }
    else {
      query += sizing;
    }

    console.log('query', query, totalRecords);
    const execQuery = await conn.query(query);
    const execQueryTotalRecords = await conn.query(totalRecords);
    let TotalRocoreds = 0;
    if (execQueryTotalRecords && execQueryTotalRecords['rows'] && execQueryTotalRecords['rows'].length) {
      TotalRocoreds = execQueryTotalRecords['rows'].length;
    }
    if (execQuery && execQuery['rows'] && execQuery['rows'].length) {
      for (let elem of execQuery['rows']) {
        let date = elem.dateEpoch;
        let newEpoch = (Number(date)) * 1000;
        elem.dateEpoch = newEpoch;
      }
      response.getRuleAuditLog.data.searchResult = execQuery['rows'];
      response.getRuleAuditLog.pageData.totalRecords = TotalRocoreds;
      response.getRuleAuditLog.pageData.pageSize = body.pageSize;
      response.getRuleAuditLog.pageData.currentPageNo = body.pageNumber;
    }
    callback(response);
  } catch (error) {
    response.getRuleAuditLog.data.message.errorDescription = error.message;
    response.getRuleAuditLog.data.message.status = 'Error';
    response.getRuleAuditLog.data.message.displayToUser = true;
    callback(response);
    throw new Error(error.stack);
  }
};
