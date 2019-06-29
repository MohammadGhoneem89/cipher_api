'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getRuleAuditLog = async function (payload, UUIDKey, route, callback, JWToken) {
    let body = payload.body;
    let searchCriteria = false;
    if (Object.keys(body.searchCriteria).length && Object.keys(body.searchCriteria).length > 0) {
        searchCriteria = true
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
        const conn = await pg.connection()
        let sizing = ` ORDER BY "id" DESC LIMIT ${body.pageSize} OFFSET ${body.pageNumber};`
        let totalRecords = `Select * from public."ruleauditlog"`;
        let query = `Select r.datastructure, r.datastructureid, r.notification, r.correction, r.id as internalid, r.ruleid, r.datetime, nr.* from public."ruleauditlog" r inner join
        "NotificationsRule" nr  on  nr.id=r.ruleid`;
        console.log(payload.body)
        if (searchCriteria) {
            let whereClause = null;
            if (body.searchCriteria.dataStructure) {
                whereClause = `"datastructure" like '%${body.searchCriteria.dataStructure}%' `
            }

            if (body.searchCriteria.ruleName) {
                if (whereClause !== null) {
                    whereClause += `AND `
                }
                whereClause += `"rulename" LIKE '%${body.searchCriteria.ruleName}%'`
            }

            if (body.searchCriteria.notificationStatus) {
                if (whereClause !== null) {
                    whereClause += `AND `
                }
                whereClause += `"status" = '${body.searchCriteria.ruleName}'`
            }
            if (whereClause === null) {
                query += ` ${sizing}`;
            } else {
                query += ` WHERE ${whereClause} ${sizing}`;
            }


        } else {
            query += sizing
        }

        console.log('query', query, totalRecords)
        const execQuery = await conn.query(query);
        const execQueryTotalRecords = await conn.query(totalRecords);
        let TotalRocoreds = 0;
        if (execQueryTotalRecords && execQueryTotalRecords['rows'] && execQueryTotalRecords['rows'].length) {
            TotalRocoreds = execQueryTotalRecords['rows'].length;
        }
        if (execQuery && execQuery['rows']) {
            response.getRuleAuditLog.data.searchResult = execQuery['rows'];
            response.getRuleAuditLog.pageData.totalRecords = TotalRocoreds;
            response.getRuleAuditLog.pageData.pageSize = body.pageSize;
            response.getRuleAuditLog.pageData.pageNumber = body.pageNumber;
        }
        callback(response);
    } catch (error) {
        response.getRuleAuditLog.data.message.errorDescription = error.message;
        response.getRuleAuditLog.data.message.status = 'Error';
        response.getRuleAuditLog.data.message.displayToUser = true;
        callback(response);
        throw new Error(error.stack)
    }
};