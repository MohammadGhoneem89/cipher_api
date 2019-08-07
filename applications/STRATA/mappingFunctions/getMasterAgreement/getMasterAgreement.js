'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');


function getMasterAgreement(payload, UUIDKey, route, callback, JWToken) {

    let queryData = `SELECT * FROM masteragreements  WHERE 1=1`;
   // let queryCnt = `SELECT COUNT(*) FROM masteragreements  WHERE 1=1`;
    let query = '';

    if (payload.body.searchCriteria && payload.body.searchCriteria.contractID) {
        let contractID = payload.body.searchCriteria.contractID;
        query += ` AND "tranxData" ->> 'contractID' = '${contractID}' `;
    }
    //let query_ = queryCnt + query
    let queryCriteriaFull = queryData + query;

    if (payload.body.page) {
        queryCriteriaFull += ` limit ${payload.body.page.pageSize} 
    OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
    }
    console.log("queryCriteriaFull --->", queryCriteriaFull);
    pg.connection().then((conn) => {
        console.log("Connected to DB")
        return Promise.all([
           //  count = conn.query(queryCnt, []),
            conn.query(queryCriteriaFull, [])
        ]).then((data) => {
            let result = [];
            if (data) {
                _.get(_.get(data, '[0]', {}), 'rows', []).forEach((elemt) => {
                    result.push(elemt.tranxData);
                });
            }
            let response = {
                "getMasterAgreement": {
                    "action": "getMasterAgreement",
                    "pageData": {
                        "pageSize": payload.body.page.pageSize,
                        "currentPageNo": payload.body.page.currentPageNo,
                        "totalRecords": result.length
                    },
                    "data": {
                        "searchResult": result
                    }
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