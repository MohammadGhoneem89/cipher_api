'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');


function getOrderList(payload, UUIDKey, route, callback, JWToken) {

    let queryData = `SELECT "tranxData","txnid" FROM orders  WHERE 1=1`;
    let queryCnt = `SELECT COUNT(*) FROM orders  WHERE 1=1`;
    let query = '';

    if (payload.body.searchCriteria && payload.body.searchCriteria.orderID) {
        let orderID = payload.body.searchCriteria.orderID;
        query += ` AND "tranxData" ->> 'orderID' = '${orderID}' `;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.contractID) {
        let contractID = payload.body.searchCriteria.contractID;
        query += ` AND "tranxData" ->> 'contractID' = '${contractID}' `;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.orderStatus) {
        let orderStatus = payload.body.searchCriteria.orderStatus;
        query += ` AND "tranxData" ->> 'status' = '${orderStatus}' `;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.fromDate) {
        let fromDate = payload.body.searchCriteria.fromDate;
        query += ` AND "tranxData" ->> 'orderDate' >= '${fromDate}' `;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.toDate) {
        let toDate = payload.body.searchCriteria.toDate;
        query += ` AND "tranxData" ->> 'orderDate' <= '${toDate}' `;
    }
    let query_ = queryCnt + query
    let queryCriteriaFull = queryData + query;

    if (payload.body.page) {
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
            // console.log(data[1].rows, "???? data")
            let result = [];
            if (data) {
                let info = data[1].rows
                for (let i in info) {
                    data[1].rows[i].tranxData.trxid = data[1].rows[i].txnid;
                }
                _.get(_.get(data, '[1]', {}), 'rows', []).forEach((elemt) => {
                    _.set(elemt.tranxData, 'gridKey', `${_.get(elemt.tranxData, 'orderID', '')}/${_.get(elemt.tranxData, 'customerID', '')}`);

                    result.push(elemt.tranxData);
                });
            }
            console.log(result, "???? data");
            let response = {
                "getOrders": {
                    "action": "getOrders",
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

exports.getOrderList = getOrderList;