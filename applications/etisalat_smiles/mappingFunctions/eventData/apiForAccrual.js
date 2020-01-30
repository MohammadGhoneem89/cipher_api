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
    console.log("\n\npayload from accrual api  >>> ", payload.body);
    let points = parseInt(payload.body.points);
    let amount = parseInt(payload.body.amount);

    console.log("\n\n >>>>>>>> payload.body.masterRecordId >>>> ", payload.body.masterRecordId)

    let masterRecordID = payload.body.masterRecordId;
    let status, statusCode, statusdescription;
    if (masterRecordID.indexOf("F") > -1) {
        status = "FAILED";
        statusCode = "400";
        statusdescription = "FAILED TRANSACTION"
    } else if (masterRecordID.indexOf("P") > -1) {

        status = "PENDING";
        statusCode = "400";
        statusdescription = "PENDING TRANSACTION"

    } else {
        status = "SUCCESS";
        statusCode = "200";
        statusdescription = "SUCCESSFUL TRANSACTION"
    }

    if (amount > 0) {
        points = (amount * 10) / 100;
        // amount = amount - points;
    }
    console.log("points >>> ", points)
    let queryData = `UPDATE LMS SET "currentpoints" = "currentpoints" + ${points} where 
    "program_name" = 'SMILES' AND
     "membershipno"='${payload.body.membershipNo}'`;

    console.log("\n\n querydata >>> ", queryData)

    pg.connection().then((conn) => {
        console.log("Connected to DB successfully !")
        return Promise.all([
            conn.query(queryData, [])
        ]).then((data) => {
            console.log(data, " << DATA")
            let result = [];
            let response = {
                status: status,
                statusCode: statusCode,
                statusdescription: statusdescription,
                paymentRef: "XYZ",
                //  pointsAwarded: points ? 1 : points,
                pointsCredited: points,
                isRetry: "false",
                isReversal: "false",
                Amount: amount

            };
            return callback(response);
        }).catch(err => { console.log("ERROR >> ", err); return err; });
    }).catch((err) => {
        console.log("Some Error occurred while executing query..! ", err);
        return callback(err);
    });
}

exports.apiForAccrual = apiForAccrual;