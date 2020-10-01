'use strict';
const sqlserver = require('../../../core/api/connectors/mssql');
// const {
//     successWithObject, error
// } = require('../../../lib/response');
// const {
//     getFileListQuery
// } = require('../../../lib/queries');

// const { validateJsonLength } = require('../../../lib/utils');
// const { calculateOffset } = require('../../../lib/utils');
const { json } = require('sequelize');
const moment = require('moment');

async function getDocumentTypeList(payload, UUIDKey, route, callback, JWToken) {
    // console.log('payload', payload)

    console.log(payload)

    try {
        let query;
        query = `SELECT * FROM consentManagement.dbo.documenttype`;


        console.log('====', query)

        sqlserver
            .connection().then(async (conn) => {
                console.log("Connected to DB successfully !")
                return Promise.all([
                    conn.query(query),
                ]).then((data) => {
                    console.log(data)
                    const finalResponse = {
                        "messageStatus": "OK",
                        "errorDescription": "Processed OK!",
                        "errorCode": 200,
                        "timestamp": moment().format("DD/MM/YYY hh:mm:ss.SSS"),
                        "documentTypeList": data[0].recordset
                    };
                    return callback(finalResponse)
                });
            });

    } catch (err) {
        return callback(err);
    }

}

module.exports={
    getDocumentTypeList
}
