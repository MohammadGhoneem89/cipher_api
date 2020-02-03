'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const moment = require('moment');
const timestamp = moment().format('DD/MM/YYYY HH:mm:ss a');

async function getLMSData(payload, UUIDKey, route, callback, JWToken) {
    const queryData = `select * from LMS`;
    try {
        const connection = await pg.connection();
        const queryResult = await connection.query(queryData);
        console.log(queryResult.rows, " << queryResult");
        return callback({
            messageStatus: "Processed OK!",
            errorCode: 200,
            errorDescription: "",
            timestamp,
            "getLMSData": {
                "action": "getLMSData",
                "pageData": {
                    "pageSize": queryResult.rows.length,
                    "currentPageNo": 1,
                    "totalRecords": queryResult.rows.length
                },
                "searchResult": queryResult.rows
            }
        });
    }
    catch (err) {
        console.log("Error occurred while executing query..! ", err);
        return callback({
            messageStatus: "ERROR",
            errorCode: 201,
            errorDescription: err,
            timestamp,
            "searchResult": []

        });
    };
}

exports.getLMSData = getLMSData;