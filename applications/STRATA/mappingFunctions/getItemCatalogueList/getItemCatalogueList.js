'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');


function getItemCatalogueList(payload, UUIDKey, route, callback, JWToken) {

    let queryData = `SELECT * FROM itemcatalogues WHERE 1=1`;
    let queryCnt = 'SELECT count(*) FROM itemcatalogues WHERE 1=1';
    let query = '';
    
    if (payload.body.searchCriteria && payload.body.searchCriteria.itemCode) {
        let itemCode = payload.body.searchCriteria.itemCode;
        query += ` AND "tranxData" ->> 'itemCode' = '${itemCode}' `;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.name) {
       let name = payload.body.searchCriteria.name;
        //let name= payload.body.searchCriteria.name.replace(/ /gi, '|')
        console.log("NAME",`'${name}'`)
        query += ` AND "tranxData" ->> 'name' LIKE '%${name}%'`;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.description) {
        //let description= payload.body.searchCriteria.description.replace(/ /gi, '|')
        let description= payload.body.searchCriteria.description
        console.log("description",`'${description}'`)
        query += ` AND "tranxData" ->> 'description' LIKE '%${description}%'`;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.material) {
        //let material= payload.body.searchCriteria.material.replace(/ /gi, '|')
        let material= payload.body.searchCriteria.material
        console.log("material",`'${material}'`)
        query += ` AND "tranxData" ->> 'material' LIKE '%${material}%'`;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.description) {
        //let description= payload.body.searchCriteria.description.replace(/ /gi, '|')
        let description= payload.body.searchCriteria.description
        console.log("description",`'${description}'`)
        query += ` AND "tranxData" ->> 'description' LIKE '%${description}%'`;
    }
    let queryCriteriaFull = queryData + query;
    let queryCriteria = queryCnt + query;

    if (payload.body.page && payload.body.page.pageSize) {
        queryCriteriaFull += ` limit ${payload.body.page.pageSize} 
    OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
    }
    console.log("queryCriteriaFull --->", queryCriteriaFull);

    pg.connection().then((conn) => {
        console.log("Connected to DB successfully !")
        return Promise.all([
            conn.query(queryCriteria, []),
            conn.query(queryCriteriaFull, [])
            
        ]).then((data) => {
           // console.log(data,"DATA")
            let result = [];
            if (data) {
                _.get(_.get(data, '[1]', {}), 'rows', []).forEach((elemt) => {
                    result.push(elemt.tranxData);
                });
            }
            
            // let countRows=data[0].rows[0].count
            // console.log(countRows, "<-----countRows")
            let response = {
                "getItemCatalogue": {
                    "action": "getItemCatalogue",
                    "pageData": {
                        "pageSize": payload.body.page ? payload.body.page.pageSize : undefined,
                        "currentPageNo": payload.body.page ? payload.body.page.currentPageNo : 1,
                        "totalRecords": data[0].rows[0].count
                    },

                    "searchResult": result

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