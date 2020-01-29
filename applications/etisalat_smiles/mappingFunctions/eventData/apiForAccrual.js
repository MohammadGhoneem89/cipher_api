'use strict';
const config = require('../../../../config')
const pg = require('../../../../core/api/connectors/postgress');
const logger = require('../../../../lib/helpers/logger')().app;
const _ = require('lodash');
const crypto = require('../../../../lib/helpers/crypto');
const rp = require('request-promise');
const dates = require('../../../../lib/helpers/dates.js')

// In case of SUCCESS 
// update currentPoints= currentPoints + 
// [AccrualAPIPayload.AccruedPoints] where program_name="SMILES" 
// and membershipNo= [AccrualAPIPayload.membershipNo]

//payload.body.accrualParams.points
// UPDATE table_name
// SET column1 = value1, column2 = value2...., columnN = valueN
// WHERE [condition];
function apiForAccrual(payload, UUIDKey, route, callback, JWToken) {
    console.log("\n\npayload from accrual api  >>> ",payload.body)
    let queryData = `UPDATE LMS SET "currentpoints" = "currentpoints" + ${500} where 
    "program_name" = 'SMILES' AND
     "membershipno"='${payload.body.membershipNo}'`;

    pg.connection().then((conn) => {
        console.log("Connected to DB successfully !")
        return Promise.all([
            conn.query(queryData, [])
        ]).then((data) => {
            console.log(data, " << DATA")
            let result = [];
            let response = {
                    status:"SUCCESS",
                    statusCode: "200",
                    statusdescription: "SUCCESSFUL TRANSACTION",
                    paymentRef: "XYZ",
                    pointsCredited:4505,
                    isRetry: "false",
                    isReversal: "false"
                
            };
            return callback(response);
        }).catch(err => { console.log("ERROR >> ", err); return err; });
    }).catch((err) => {
        console.log("Some Error occurred while executing query..! ", err);
        return callback(err);
    });
}

exports.apiForAccrual = apiForAccrual