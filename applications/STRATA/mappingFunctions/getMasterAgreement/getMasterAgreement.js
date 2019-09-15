'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');


function getMasterAgreement(payload, UUIDKey, route, callback, JWToken) {

    let queryData = `SELECT * FROM masteragreements  WHERE 1=1`;
    let queryCnt = `SELECT COUNT(*) FROM masteragreements  WHERE 1=1`;
    let query = '';

    console.log(JWToken.orgCode, "JWToken")
    if (payload.body.searchCriteria && payload.body.searchCriteria.contractID) {
        let contractID = payload.body.searchCriteria.contractID;
        query += ` AND "tranxData" ->> 'contractID' = '${contractID}' `;
    }
    //if (JWToken.orgType == 'SUPPLIER') {
    if (payload.body.searchCriteria && payload.body.searchCriteria.customerID) {
        let customerID = payload.body.searchCriteria.customerID;
        query += ` AND "tranxData" ->> 'customerID' = '${customerID}' `;
    }
    // } 
    if (JWToken.orgType == 'CUSTOMER') {
        query += ` AND "tranxData" ->> 'customerID' = '${JWToken.orgCode}' `;
    }
    let query_ = queryCnt + query
    let queryCriteriaFull = queryData + query;

    if (payload.body.page && payload.body.page.pageSize && payload.body.page.currentPageNo) {
        queryCriteriaFull += ` limit ${payload.body.page.pageSize} 
    OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
    }
    console.log("queryCriteriaFull --->", queryCriteriaFull);
    pg.connection().then((conn) => {
        console.log("Connected to DB")
        return Promise.all([
            conn.query(query_, []),
            conn.query(queryCriteriaFull, [])
        ]).then((data) => {
            let result = [];
            if (data) {
                _.get(_.get(data, '[1]', {}), 'rows', []).forEach((elemt) => {
                    elemt.tranxData.uniqueId = elemt.tranxData.contractID + "/" + elemt.tranxData.customerID 
                    result.push(elemt.tranxData);
                });
            }
            let response = {
                "getMasterAgreement": {
                    "action": "getMasterAgreement",
                    "pageData": {
                        "pageSize": payload.body.page ? payload.body.page.pageSize : undefined,
                        "currentPageNo": payload.body.page ? payload.body.page.currentPageNo : 1,
                        "totalRecords": data[0].rows[0].count
                    },

                    "searchResult": result

                }
            };
            console.log(response)
            return callback(response);
        });
    }).catch((err) => {
        console.log("ERROR OCCURRED WHILE EXECUTING QUERY", err);
        return callback(err);
    });
}

exports.getMasterAgreement = getMasterAgreement;