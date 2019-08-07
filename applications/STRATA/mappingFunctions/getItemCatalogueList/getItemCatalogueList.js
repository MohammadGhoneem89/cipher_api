'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');


function getItemCatalogueList(payload, UUIDKey, route, callback, JWToken) {


    console.log(payload,"<------ PAYLOAD")
    let queryData = `SELECT * FROM itemcatalogues WHERE 1=1`;
    // let queryCnt = 'SELECT count(*) FROM deedtransfers WHERE 1=1 ';
    let query = '';

    if (payload.body.searchCriteria && payload.body.searchCriteria.itemCode) {
        let itemCode = payload.body.searchCriteria.itemCode;
        query += ` AND "tranxData" ->> 'itemCode' = '${itemCode}' `;
    }
    //let queryCriteria = queryCnt + query;
    let queryCriteriaFull = queryData + query;

    if (payload.body.page) { 
        queryCriteriaFull += ` limit ${payload.body.page.pageSize} 
    OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
 }
    console.log("queryCriteriaFull --->",queryCriteriaFull);

    pg.connection().then((conn) => {
        console.log("<------- Successfully connected --------->")
        return Promise.all([
            conn.query(queryCriteriaFull, [])
        ]).then((data) => {
            console.log(data[0].rows,"<----DATA")
            console.log(data[0].rows.length,"<----length")
            return callback(data[0].rows);
            });
    }).catch((err) => {
         console.log("ERROR OCCURRED WHILE EXECUTING QUERY",err);
        return callback(err);
    });
}

exports.getItemCatalogueList = getItemCatalogueList;