'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');


function getItemCatalogueList(payload, UUIDKey, route, callback, JWToken) {

    let queryData = `SELECT * FROM itemcatalogues WHERE 1=1`;
    let query = '';

    if (payload.body.searchCriteria && payload.body.searchCriteria.itemCode) {
        let itemCode = payload.body.searchCriteria.itemCode;
        query += ` AND "tranxData" ->> 'itemCode' = '${itemCode}' `;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.description) {
        let description = payload.body.searchCriteria.description;
        query += ` AND "tranxData" ->> 'description' ='${description}'`;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.material) {
        let material = payload.body.searchCriteria.material;
        query += ` AND "tranxData" ->> 'material' ='${material}'`;
    }
    let queryCriteriaFull = queryData + query;

    if (payload.body.page) {
        queryCriteriaFull += ` limit ${payload.body.page.pageSize} 
    OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
    }
    console.log("queryCriteriaFull --->", queryCriteriaFull);

    pg.connection().then((conn) => {
        console.log("Connected to DB")
        return Promise.all([
            conn.query(queryCriteriaFull, [])
        ]).then((data) => {
            let result = [];
            if (data) {
                _.get(_.get(data, '[0]', {}), 'rows', []).forEach((elemt) => {
                    result.push(elemt.tranxData);
                });
            }
            let response = {
                "getItemCatalogue": {
                    "action": "getItemCatalogue",
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
            return callback(response);
        });
    }).catch((err) => {
        console.log("ERROR OCCURRED WHILE EXECUTING QUERY", err);
        return callback(err);
    });
}

exports.getItemCatalogueList = getItemCatalogueList;