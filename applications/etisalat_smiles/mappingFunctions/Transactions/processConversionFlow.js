'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');
const fs = require('fs');
const crypto = require("crypto");
let rp = require('request-promise');
const { resolve, basename, dirname } = require('path');
const events = require('events').EventEmitter;
const emitter = new events.EventEmitter();
const skipBottomLines = 0;
const skipLines = 1;
const dates = require('../../../../lib/helpers/dates');
const Sequelize = require('sequelize');
const pgModels = require('../PostgreModel.js')
var filename = "";
const { Op } = require("sequelize");
const endpointDefination = require('../../../../lib/repositories/endpointDefination');
const apiTemplate = require('../../../../lib/repositories/apiTemplate');
const transformTemplate = require('../../../../lib/helpers/transformTemplate');

const config = require('./../../../../config');




async function processConversionFlow(payload, UUIDKey, route, callback, JWToken) {

    let pdatac = {}
    let txid = _.get(payload, "body.key", "")
    let processingType = _.get(payload, "body.processingType", "")
    let loyaltyProgramCode = _.get(payload, "body.from", "")
    let targetLoyaltyProgramCode = _.get(payload, "body.to", "")
    let points = _.get(payload, "body.points", "")
    let membershipNo = _.get(payload, "body.membershipNo", "")

    _.set(pdatac, "errorReason", "");
    _.set(pdatac, "errorDescription", "");

    _.set(pdatac, "targetLoyaltyProgramCode", targetLoyaltyProgramCode);
    _.set(pdatac, "loyaltyProgramCode", loyaltyProgramCode);
    _.set(pdatac, "transactionID", txid);
    _.set(pdatac, "pointsAwarded", parseInt(points));
    _.set(pdatac, "pointsDebited", parseInt(points));
    _.set(pdatac, "status", "SUCCESS")


    payload['config'] = config._instance
    payload['uuid'] = UUIDKey

    payload['uuidsmall'] = crypto.randomBytes(10).toString("hex");


    let flow = config.get("flow.oauthToken")
    if (processingType == "DEBIT") {
        flow = flow.concat(config.get("flow.ReservePointForPartner"))

    } else if (processingType == "CREDIT") {

        flow = flow.concat(config.get("flow.AccuralforPartner"))
    } else if (processingType == "CommitDebit") {

        flow = flow.concat(config.get("flow.CommitRedemPoints"))
    } else {

        return callback({
            status: "Failed",
            message: "Not found flow things",
            error: true
        })
    }

    let error = null;

    let KeyValue = {}
    for (let i = 0; i < flow.length; i++) {

        error = await postTemplateOnGivenPayload(payload, flow[i].action, flow[i].errorPath, flow[i].failureMessage)
        _.set(pdatac, "otherParty." + flow[i].action + ".request", _.get(payload, flow[i].action + "_request"));
        _.set(pdatac, "otherParty." + flow[i].action + ".response", _.get(payload, flow[i].action));
        if (error) {
            _.set(pdatac, "status", "FAILURE");

            _.set(pdatac, "errorReason", JSON.stringify(error))
            _.set(pdatac, "status", "FAILURE");
            break;

        } else if (flow[i].details != undefined && flow[i].details != null) {

            valuesSet(payload, KeyValue, flow[i].details)
        }
    }

    _.set(pdatac, "details", KeyValue)

    if (loyaltyProgramCode != "ETISALAT") {
        _.set(pdatac, "status", null);
        _.set(pdatac, "errorReason", null)
        _.set(pdatac, "status", "SUCCESS");


    }

    let requestConfirm = {}
    let data = await confirmTransaction(requestConfirm, pdatac);




    if (error) {
        return callback({
            otherParty: _.get(pdatac, "otherParty", null),,
            status: "Failure",
            confirmRequest: requestConfirm,
            confirmResponse: data,
            message: error,
            messageId: UUIDKey
        });
    } else {

        return callback({
            data: data,
            otherParty: _.get(pdatac, "otherParty", null),
            confirmRequest: requestConfirm,
            status: "Success",
            message: "Processed OK",
            messageId: UUIDKey
        });

    }














    // error = await postTemplateOnGivenPayload(payload, "OauthToken", "error", "invalid_scope")
    // error = await postTemplateOnGivenPayload(payload, "AuthTokenPartner", "authTokenForPartnerResponse.ackMessage.status", "FAILURE")
    // error = await postTemplateOnGivenPayload(payload, "ReservePointForPartner", "reservePointsForPartnerResponse.ackMessage.status", "FAILURE")


    // //console.log(data["access_token"])
    // //console.log(_.get(data, "access_token", "n/a"))
    // let data2 = await getPartnerAuthToken(
    //     {
    //         "Authorization": "Bearer " + data.access_token,
    //         "ClientId": "18464db6a59a0562ac7ddf14f70752cd",
    //         "X-TIB-TransactionID": UUIDKey,
    //         "X-TIB-RequestedSystem": "SmilesBC"


    //     }, {

    //     "authTokenForPartnerRequest": {
    //         "channelId": "BLOCKC",
    //         "accountNumber": "0543931899",
    //         "system": {
    //             "Id": "BLOCKC",
    //             "password": "6ZqX!4@N_"
    //         }
    //     }
    // });









    try {


        let pdatac = {}
        let txid = _.get(payload, "body.key", "")
        let processingType = _.get(payload, "body.processingType", "")
        let loyaltyProgramCode = _.get(payload, "body.from", "")
        let targetLoyaltyProgramCode = _.get(payload, "body.to", "")
        let points = _.get(payload, "body.points", "")
        let membershipNo = _.get(payload, "body.membershipNo", "")
        _.set(pdatac, "errorReason", "");
        _.set(pdatac, "errorDescription", "");





        console.log("TXNID " + txid + "  processingType  " + processingType)
        let queryData = "";
        let sign = ""
        let isExecute = false;


        if (processingType.includes('REVERSEDEBIT')) {
            sign = "+"
            isExecute = true
            _.set(pdatac, "status", "SUCCESS");
            //executeQuery(queryData)
        } else if (processingType.includes('REVERSECREDIT')) {
            sign = "-"
            isExecute = true
            _.set(pdatac, "status", "SUCCESS");
            //executeQuery(queryData)
        } else if ((txid.includes('_SS_') || txid.includes('_SF_') || txid.includes('_ST_')) && processingType.includes('DEBIT')) {
            _.set(pdatac, "status", "SUCCESS");
            sign = "-"
            isExecute = true

        } else if (txid.includes('_F_') && processingType.includes('DEBIT')) {
            _.set(pdatac, "status", "FAILURE");
            //sign="-"
            isExecute = false

        } else if (txid.includes('_T_') && processingType.includes('DEBIT')) {

            console.log("going for time out")
            _.set(pdatac, "status", "TIMEOUT");
            sign = "-"
            isExecute = true

        } else if (txid.includes('_SS_') && processingType.includes('CREDIT')) {

            sign = "+"
            _.set(pdatac, "status", "SUCCESS");
            isExecute = true
        } else if (txid.includes('_SF_') && processingType.includes('CREDIT')) {
            //sign="-"
            _.set(pdatac, "status", "FAILURE");
            isExecute = false
        } else if (txid.includes('_ST_') && processingType.includes('CREDIT')) {
            sign = "+"
            _.set(pdatac, "status", "TIMEOUT");
            isExecute = true
        } else if (processingType.includes('CREDIT')) {
            sign = "+"
            _.set(pdatac, "status", "SUCCESS");
            isExecute = true
        } else if (processingType.includes('DEBIT')) {
            _.set(pdatac, "status", "SUCCESS");
            sign = "-"
            isExecute = true
        } else {
            return callback({
                status: "failed",
                RESULT: "not found flow things",
                error: true
            })

        }


        let isPointsAvailable = await getLmsdata(loyaltyProgramCode, membershipNo, parseFloat(points));

        if (processingType == 'DEBIT' && !isPointsAvailable) {
            _.set(pdatac, "status", "FAILURE");
            _.set(pdatac, "errorReason", "Point are not available")
            isExecute = false
        }


        queryData = `UPDATE LMS SET "currentpoints" = "currentpoints" ${sign} ${points} where 
        "program_name" = '${loyaltyProgramCode}' AND
         "membershipno"='${membershipNo}'`;
        if (isExecute) {
            console.log("action+  " + processingType + " Query " + queryData)
            executeQuery(queryData)
        }

        console.log(loyaltyProgramCode + "<<<<<<<<<")


        _.set(pdatac, "targetLoyaltyProgramCode", targetLoyaltyProgramCode);
        _.set(pdatac, "loyaltyProgramCode", loyaltyProgramCode);
        _.set(pdatac, "transactionID", txid);
        _.set(pdatac, "pointsAwarded", parseInt(points));
        _.set(pdatac, "pointsDebited", parseInt(points));
        // _.set(pdatac,"status","SUCCESS");




        let data = await confirmTransaction({}, pdatac);

        return callback({
            status: "success",
            RESULT: data,
            error: false
        })



    } catch (e) {


        let response = {
            "messageStatus": "error",
            "messageId": UUIDKey,
            "errorDescription": "error while fetching error.",
            "errorCode": 500,
            "timestamp": dates.newDate(),
        }

        console.log(e.stack)
        callback(response);
    }

}


function valuesSet(payload, sdata, valuesarray) {
    Object.keys(valuesarray).forEach(key => {

        _.set(sdata, key, _.get(payload, valuesarray[key], null))
    })

}

function executeQuery(queryData) {

    pg.connection().then((conn) => {
        console.log("Connected to DB successfully !")
        return Promise.all([
            conn.query(queryData, [])
        ]).then((data) => { })
    });
}


function processFlow(flow) {


}



async function getLmsdata(loyaltyProgramCode, membershipNo, points) {
    const queryData = `select * from LMS where "program_name" = '${loyaltyProgramCode}' AND
    "membershipno"='${membershipNo}'`;

    console.log("currentpoints >>>" + queryData)
    try {
        const connection = await pg.connection();
        const queryResult = await connection.query(queryData);

        console.log("POINT AVAILABLE" + queryResult.rows[0].currentpoints + " Conversion required " + points)
        return queryResult.rows[0].currentpoints >= points
        //  console.log(">> data"+ JSON.stringify(queryResult.rows[0]))

    } catch (err) {
        console.log(err)
        return false;
    }
}






async function postTemplateOnGivenPayload(payload, templateName, errorPath, failureStatus) {
    try {

        let transformedTemplate = await getAndTransformTemplate(payload, templateName)
        let request = { method: 'POST', form: transformedTemplate.form, url: transformedTemplate.url, headers: transformedTemplate.header, body: transformedTemplate.data, json: true };
        let responseData = await getPostData(request)
        payload[templateName] = responseData;
        payload[templateName + "_request"] = request
        let errorStatus = _.get(responseData, errorPath, null)
        if (errorPath != null && errorStatus == failureStatus) {
            return { Error: responseData, Message: "Error when Trying " + templateName }
        }

    } catch (err) {
        console.log(err)
        return err.message ? { Error: err, Message: "Error catching when Trying " + templateName } : undefined;
    }

}

async function getOauthToken(payload) {
    try {
        let transformedTemplate = await getAndTransformTemplate(payload, "OauthToken")
        console.log("Transformed Template >>>>>>>>>>>>>>")
        console.log(transformedTemplate)
        let responseData = await getPostData({ method: 'POST', url: transformedTemplate.url, form: transformedTemplate.form, json: true })
        payload.oauth = responseData;
    } catch (err) {
        return { Error: err, Message: "Error when Trying " + " OauthToken" };
    }
}


async function getPostData(options) {
    console.log("REQUEST===============>", options, "<===============REQUEST");
    options.timeout = config.get("timeout") || 5000
    // options.resolveWithFullResponse = true
    //  console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options)
}

async function getAndTransformTemplate(payload, templateName) {
    let template = await apiTemplate.findOneByName({ name: templateName })
    return transformTemplate(template, payload)

}



function confirmTransaction(request, payload) {
    console.log("PAYLOADY=====================> ",
        payload, " <=====================PAYLOADY");

    let options = {
        method: 'POST',
        url: 'http://localhost:' + config.get("port") + '/API/SMILES/confirmTransaction',
        body:
        {
            header:
            {
                "username": "Internal_API",
                "password": "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
            },
            body: {
                "loyaltyProgramCode": _.get(payload, "loyaltyProgramCode", ""),
                "targetLoyaltyProgramCode": _.get(payload, "targetLoyaltyProgramCode", ""),
                "details": _.get(payload, "details", ""),
                "transactionType": "POINTCONVERSION",
                "transactionID": _.get(payload, "transactionID", null),
                "pointsAwarded": _.get(payload, "pointsAwarded", null),
                "pointsDebited": _.get(payload, "pointsDebited", null),
                "status": _.get(payload, "status", null),
                "errorReason": _.get(payload, "errorReason", null),
                "errorDescription": _.get(payload, "errorDescription", null),
            }

        },
        json: true
    };
    request = options.body
    console.log("REQUEST===============>", options.body, "<===============REQUEST");
    return rp(options);

}
exports.processConversionFlow = processConversionFlow