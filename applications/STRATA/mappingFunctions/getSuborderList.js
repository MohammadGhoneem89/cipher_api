'use strict';
const pg = require('../../../core/api/connectors/postgress');
const _ = require('lodash');


function getSubOrderList(payload, UUIDKey, route, callback, JWToken) {

    let queryData = `SELECT * FROM suborders  WHERE 1=1`;
    let queryCnt = `SELECT COUNT(*) FROM suborders  WHERE 1=1`;
    let query = '';

    if (payload.body.searchCriteria && payload.body.searchCriteria.subOrderID) {
        let subOrderID = payload.body.searchCriteria.subOrderID;
        query += ` AND "tranxData" ->> 'subOrderID' = '${subOrderID}' `;
    }
    
    if (payload.body.searchCriteria && payload.body.searchCriteria.status) {
        let status = payload.body.searchCriteria.status;
        query += ` AND "tranxData" ->> 'status' = '${status}' `;
    }
   
    let query_ = queryCnt + query;
    let queryCriteriaFull = queryData + query;

    if (payload.body.page) {
        queryCriteriaFull += ` limit ${payload.body.page.pageSize} 
    OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
    }
    console.log("queryCriteriaFull --->", queryCriteriaFull);
    pg.connection().then((conn) => {
        console.log("Connected to DB....!!");
        return Promise.all([
            conn.query(query_, []),
            conn.query(queryCriteriaFull, [])
        ]).then((data) => {
            let result = [];
            if (data) {
                _.get(_.get(data, '[1]', {}), 'rows', []).forEach((elemt) => {
                    // _.set(elemt.tranxData, 'gridKey', `${_.get(elemt.tranxData, 'orderID', '')}/${_.get(elemt.tranxData, 'customerID', '')}`)
                    result.push(elemt.tranxData);
                });
            }
            let response = {
                "getSubOrderList": {
                    "action": "getSubOrderList",
                    "pageData": {
                        "pageSize": payload.body.page ? payload.body.page.pageSize : undefined,
                        "currentPageNo": payload.body.page ? payload.body.page.currentPageNo : 1,
                        "totalRecords": data[0].rows[0].count
                    },
                    
                        "searchResult": result
                    
                }
            };
            console.log(response);
            return callback(response);
        });
    }).catch((err) => {
        console.log("ERROR OCCURRED WHILE EXECUTING QUERY..!!", err);
        return callback(err);
    });
}

exports.getSubOrderList = getSubOrderList;