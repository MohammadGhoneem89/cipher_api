'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');


function getOrderList(payload, UUIDKey, route, callback, JWToken) {

    let queryData = `SELECT * FROM orders  WHERE 1=1`;
    let query = '';

    if (payload.body.searchCriteria && payload.body.searchCriteria.orderID) {
        let orderID = payload.body.searchCriteria.orderID;
        query += ` AND "tranxData" ->> 'orderID' = '${orderID}' `;
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
                "getOrders": {
                    "action": "getOrders",
                    "pageData": {
                        "pageSize": payload.body.page ? payload.body.page.pageSize : undefined,
                        "currentPageNo": payload.body.page ? payload.body.page.currentPageNo : 1,
                        "totalRecords": result.length
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

exports.getOrderList = getOrderList;