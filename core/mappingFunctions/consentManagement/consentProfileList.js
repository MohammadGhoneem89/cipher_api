'use strict';
const sqlserver = require('../../../core/api/connectors/mssql');
// const {
//     successWithObject, error
// } = require('../../../lib/response');
// const {
//     getFileListQuery
// } = require('../../../lib/queries');

// const { validateJsonLength } = require('../../../lib/utils');
const { json } = require('sequelize');
const moment = require('moment');

async function getConsentProfileList(payload, UUIDKey, route, callback, JWToken) {
    // console.log('payload', payload)

    console.log("payload getConsentProfileList-------->>", payload.body);

    try {
        let query;
        query = `SELECT * FROM consentManagement.dbo.consentprofile`;
        let pageSize = payload.body.page.pageSize;
        let offset = pageSize*(payload.body.page.currentPageNo-1);
        let pagination = `ORDER By id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`

        if(payload.body.searchCriteria){
            console.log("search Criteria condition hit ----------->");
            let where_clause;
            if('consentType' in payload.body.searchCriteria)
                where_clause = `where json_value(tranxData, '$.consentType') LIKE '${payload.body.searchCriteria.consentType}'`
            if ('documentType' in payload.body.searchCriteria){
                if(where_clause){
                    where_clause += `and json_value(tranxData, '$.documentType') LIKE '${payload.body.searchCriteria.documentType}'`
                }else{
                    where_clause = `where json_value(tranxData, '$.documentType') LIKE '${payload.body.searchCriteria.documentType}'`
                }
            }
            console.log('searhCriteria-------',payload.body.searchCriteria)
            
            query = query + " " + where_clause + " " + pagination;
        }
        else{
            query = query+ " " + pagination;
        }
        
         
        console.log('final query ===========', query)

        sqlserver
            .connection().then(async (conn) => {
                console.log("Connected to DB successfully !")
                return Promise.all([
                    conn.query(query),
                ]).then((data) => {
                    console.log("ConsentProfile List Data ------------=-=-=-=-=-",data)
                    const finalResponse = { 
                        "messageStatus": "OK",
                        "errorDescription": "Processed OK!",
                        "errorCode": 200,
                        "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
                        "consentProfileList": data[0].recordset
                    };
                    return callback(finalResponse)
                });
            });

    } catch (err) {
        return callback(err);
    }

}

module.exports={
    getConsentProfileList
}
