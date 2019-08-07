'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');


function getItemCatalogueList(payload, UUIDKey, route, callback, JWToken) {
    let queryData = `SELECT * FROM "itemcatalogues" WHERE 1=1 `;
    // let queryCnt = 'SELECT count(*) FROM deedtransfers WHERE 1=1 ';
    let query = '';

    if (payload.searchCriteria && payload.searchCriteria.itemCode) {
        let itemCode = payload.searchCriteria.itemCode;
        query += ` AND "tranxData" ->> 'itemCode' = '${itemCode}' `;
    }
    //let queryCriteria = queryCnt + query;
    let queryCriteriaFull = queryData + query;

    if (payload.page) { 
        queryCriteriaFull += ` limit ${payload.page.pageSize} 
    OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
 }
    console.log("queryCriteriaFull --->",queryCriteriaFull);

    pg.connection().then((conn) => {
        console.log(conn,"<----conn , successfully connected")
        return Promise.all([
           // conn.query(queryCriteria, []),
            conn.query(queryCriteriaFull, [])
        ]).then((data) => {
            console.log(data,"<----DATA")
            return callback(response);
            });
    }).catch((err) => {
        console.log(err);
        return callback(err);
    });
}

exports.getItemCatalogueList = getItemCatalogueList;