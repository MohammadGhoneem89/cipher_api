'use strict';

let rp = require('request-promise');
const pg = require('../../../../core/api/connectors/postgress');
// const transformTemplate = require('../../../../lib/helpers/transformTemplate');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
async function handleAccrualEvent(payload, UUIDKey, route, callback, JWToken) {

    try {
        console.log("<<<=Request Recieved for Event>>>")
        console.log("\n \n paylaod ??? ", payload)
        if (payload.body.Dependency == "2") {
            await sleep(3000);
        }
        switch (payload.body.eventName) {

            case "EventOnPostTransactionToBlockchain": {
                try {
                    let updateLMS = await apiForAccrual(payload);
                    let data = await getEventResponse(payload, updateLMS, callback);
                    if (data.messageStatus == "ERROR") {

                        await apiForAccrual(payload, true);
                        return callback({
                            status: "error",
                            errorCode: 201,
                            RESULT: data,
                            error: true
                        })
                    } else {
                        return callback({
                            status: "success",
                            RESULT: data,
                            error: false
                        })
                    }

                } catch (error) {
                    console.log("\n\n ERROR ????? ", error)
                    return callback({ error: true });
                }
            }

            default:
                callback({
                    error: true,
                    message: "invalid case"
                });
                break;
        }
    }
    catch (err) {
        console.log(err)
    }
}



async function getEventResponse(payload, updateLMS, confirmTransaction, callback) {
    try {

        console.log(">>>>>> updateLMS >>>>  ", updateLMS, " updateLMS   ++++++++++++++++++++  pl", JSON.stringify(payload) + " \n\n ");
        //let confrmTxn = await confirmTransaction(updateLMS, payload);

        // return async () => {
        let options = {
            method: 'POST',
            url: 'http://localhost:9089/API/SMILES/confirmTransaction',
            body:
            {
                header:
                {
                    "username": "Internal_API",
                    "password": "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
                },
                body: {

                    "membershipNo": updateLMS.membershipNo,
                    "transactionType": payload.body.transactionType,
                    "transactionID": payload.body.key,
                    "pointsAwarded": parseInt(updateLMS.pointsCredited),
                    "status": updateLMS.status,
                    "errorReason": updateLMS.statusCode,
                    "errorDescription": updateLMS.statusDescription,
                    "paymentRef": updateLMS.paymentRef,
                    "isRetry": updateLMS.isRetry,
                    "isReversal": updateLMS.isReversal,
                    "loyaltyProgramCode": payload.body.processingType == 'POINTCONVERSION-CREDIT-POINTS' ? payload.body.to : payload.body.from,
                    "targetLoyaltyProgramCode": payload.body.processingType == 'POINTCONVERSION-CREDIT-POINTS' ? payload.body.from : payload.body.to
                }

            },
            json: true
        };



        return rp(options);
        // }
        // return confrmTxn;
    } catch (error) {
        console.log("ERROR OCCURRED WHILE EXECUTING getEventResponse ", error)
        return error

    }

    // fnToExecute().then(response => {
    //     console.log("\n\n RESPONSE===============>", response, "<===============RESPONSE");
    //     confirmTransaction(response, payload).then(res => {
    //         console.log(">>>>>>>>>> CONFIRM TRANSACTION >>>>>>>>>>>>");
    //         callback({
    //             error: false,
    //             message: payload.body.eventName + " Dispatched",
    //             res: res
    //         })
    //     }).catch(error => {
    //         callback({
    //             error: true,
    //             message: payload.body.eventName + " Failed",
    //             response: error
    //         })
    //     });

    // }).catch(err => {
    //     console.log("error : ", err);
    //     confirmTransaction(response, payload).then(res => {
    //         callback({
    //             error: false,
    //             message: payload.body.eventName + " Dispatched",
    //             res: res
    //         })
    //     }).catch(error => {
    //         callback({
    //             error: true,
    //             message: payload.body.eventName + " Failed",
    //             response: error
    //         })
    //     });
    // });
}



function confirmTransaction(response, payload) {
    console.log("PAYLOADY=====================> ",
        response, " <=====================PAYLOADY");
    return async () => {
        let options = {
            method: 'POST',
            url: 'http://localhost:9089/API/SMILES/confirmTransaction',
            body:
            {
                header:
                {
                    "username": "Internal_API",
                    "password": "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
                },
                body: {
                    "loyaltyProgramCode": "CBD",
                    "targetLoyaltyProgramCode": "ETISALAT",
                    "membershipNo": response.membershipNo,
                    "transactionType": payload.body.transactionType,
                    "transactionID": "0d497140-41e3-11ea-abe1-9fbc7547ae36",
                    "pointsAwarded": response.pointsCredited,
                    "status": response.status,
                    "errorReason": response.statusCode,
                    "errorDescription": response.statusDescription,
                    "paymentRef": response.paymentRef,
                    "isRetry": response.isRetry,
                    "isReversal": response.isReversal
                }

            },
            json: true
        };
        // console.log("REQUEST===============>", options.body, "<===============REQUEST");
        return rp(options);
    }
}




function apiForAccrual(payload, commit) {

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
    let queryData = '';
    if (payload.body.processingType == 'POINTCONVERSION-DEBIT-POINTS') {
        queryData = `UPDATE LMS SET "currentpoints" = "currentpoints" - ${points} where 
    "program_name" = '${payload.body.withPartnerCode}' AND
     "membershipno"='${payload.body.membershipNo}'`;
    } else {
        queryData = `UPDATE LMS SET "currentpoints" = "currentpoints" + ${points} where 
    "program_name" = '${payload.body.withPartnerCode}' AND
     "membershipno"='${payload.body.membershipNo}'`;
    }
    console.log("\n\n querydata >>> ", queryData)
    if (commit) {
        return pg.connection().then((conn) => {
            console.log("Connected to DB successfully !")
            return Promise.all([
                conn.query(queryData, [])
            ]).then((data) => {
                let response = {
                    status: status,
                    statusCode: statusCode,
                    statusdescription: statusdescription,
                    paymentRef: "XYZ",
                    pointsCredited: points,
                    isRetry: "false",
                    isReversal: "false",
                    Amount: amount,
                    membershipNo: payload.body.membershipNo

                };
                return response;
            }).catch(err => { console.log("ERROR >> ", err); return err; });
        }).catch((err) => {
            console.log("Some Error occurred while executing query..! ", err);
            return err;
        });
    } else {
        let response = {
            status: status,
            statusCode: statusCode,
            statusdescription: statusdescription,
            paymentRef: "XYZ",
            pointsCredited: points,
            isRetry: "false",
            isReversal: "false",
            Amount: amount,
            membershipNo: payload.body.membershipNo

        };
        return response;
    }

}

exports.handleAccrualEvent = handleAccrualEvent;


{/* <description>The accrual has been processed properly and a confirmation message has been sent to the customer!</description>
<response>000</response>
<pointsCredited>600</ pointsCredited>
<membershipNo>2387483748</ membershipNo >
<transactionId/> */}

// "paymentRef": response.paymentRef,
// "isRetry": response.isRetry,
// "isReversal": response.isReversal






