'use strict';
const pg = require('../../../../core/api/connectors/postgress');

function getLMSData(payload, UUIDKey, route, callback, JWToken) {
    let queryData = `select * from LMS`;

    pg.connection().then((conn) => {
        console.log("Connected to DB successfully !")
        return Promise.all([
            conn.query(queryData, [])

        ]).then((data) => {
            console.log(data[0].rows, "DATA")
            let result = [];

            let response = {
                "getLMSData": {
                    "action": "getLMSData",
                    "pageData": {
                        "pageSize": data[0].rows.length,
                        "currentPageNo": 1,
                        "totalRecords": data[0].rows.length
                    },

                    "searchResult": data[0].rows

                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log("Some Error occurred while executing query..! ", err);
        return callback(err);
    });
}

exports.getLMSData = getLMSData