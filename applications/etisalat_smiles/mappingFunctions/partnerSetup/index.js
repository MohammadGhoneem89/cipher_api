'use strict';
const config = require('../../../../config')
const pg = require('../../../../core/api/connectors/postgress');
const logger = require('../../../../lib/helpers/logger')().app;
const _ = require('lodash');
const crypto = require('../../../../lib/helpers/crypto');
const rp = require('request-promise');
const dates = require('../../../../lib/helpers/dates.js')


function getPartnersList(payload, UUIDKey, route, callback, JWToken) {
    let queryData = `select "tranxData" ->>'_id' as "_id",
                            "tranxData" ->>'approvedBy' as "approvedBy",
                            "tranxData" ->>'partnerCode' as "partnerCode",
                            "tranxData" ->>'partnerErCode' as "partnerErCode",
                            "tranxData" ->>'rejectedBy' as "rejectedBy",
                            "tranxData" ->>'status' as "status",
                            "tranxData" ->>'contractParams' as "contractParams"
                        from public."interims" 
                        where 1=1`;

    let queryCnt = `SELECT count(*) FROM public."interims" where 1=1`;
    let query = '';

    if (payload.body.searchCriteria && payload.body.searchCriteria.partnerCode) {
        let partnerCode = payload.body.searchCriteria.partnerCode;
        query += ` AND lower("tranxData" ->> 'partnerCode') = lower('${partnerCode}') `;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.status) {
        let status = payload.body.searchCriteria.status;
        query += ` AND lower("tranxData" ->> 'status') = lower('${status}') `;
    }
    
    let queryCriteriaFull = queryData + query;
    let queryCriteria = queryCnt + query;

    if (payload.body.page && payload.body.page.pageSize && payload.body.page.currentPageNo) {
        queryCriteriaFull += ` limit ${payload.body.page.pageSize} 
OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
    }

    pg.connection().then((conn) => {
        console.log("Connected to DB successfully !")
        return Promise.all([
            conn.query(queryCriteria, []),
            conn.query(queryCriteriaFull, [])

        ]).then((data) => {
            console.log(data[1].rows, "DATA")
            let result = [];
            if (data) {
                _.get(_.get(data, '[1]', {}), 'rows', []).forEach((elemt) => {
                    result.push(elemt);
                });
            }
            let response = {
                "getPartnersList": {
                    "action": "getPartnersList",
                    "pageData": {
                        "pageSize": payload.body.page ? Number(payload.body.page.pageSize) : undefined,
                        "currentPageNo": payload.body.page ? Number(payload.body.page.currentPageNo) : 1,
                        "totalRecords": Number(data[0].rows[0].count)
                    },

                    "searchResult": result

                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log("Some Error occurred while executing query..! ", err);
        return callback(err);
    });
}

exports.getPartnersList = getPartnersList