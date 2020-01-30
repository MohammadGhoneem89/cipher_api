'use strict';

let rp = require('request-promise');
// const transformTemplate = require('../../../../lib/helpers/transformTemplate');

async function handleAccrualEvent(payload, UUIDKey, route, callback, JWToken) {

    try {
        console.log("<<<=Request Recieved for Event>>>")
        console.log("\n \n paylaod ??? ", payload)

        switch (payload.body.eventName) {

            case "EventOnPostTransactionToBlockchain": {
                try {
                    let data = await getEventResponse(payload, EventOnPostTransactionToBlockchain(payload), callback);
                    return callback({
                        status: "success",
                        RESULT: data,
                        error: false
                    })

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

function EventOnPostTransactionToBlockchain(payload) {
    console.log("INSIDE EventOnPostTransactionToBlockchain=====================> ",
        payload.body, " <=====================INSIDE ");
    return async () => {
        let options = {
            method: 'POST',
            url: 'http://localhost:9089/API/SMILES/apiForAccrual',
            body:
            {
                header:
                {
                    "username": "Internal_API",
                    "password": "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
                },
                body: payload.body
            },
            json: true
        };
        console.log("REQUEST===============>", options.body, "<===============REQUEST");
        return rp(options);
    }
}

async function getEventResponse(payload, fnToExecute, confirmTransaction, callback) {
    try {
        let updateLMS = await fnToExecute();

        console.log(">>>>>> updateLMS >>>>  ", updateLMS, " updateLMS   ++++++++++++++++++++  \n\n ");
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
                    "loyaltyProgramCode": "SMILES",
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
                    "targetLoyaltyProgramCode": "ETIHAD"
                }

            },
            json: true
        };
        // console.log("REQUEST===============>", options.body, "<===============REQUEST");
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
                    "loyaltyProgramCode": "SMILES",
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
exports.handleAccrualEvent = handleAccrualEvent;


{/* <description>The accrual has been processed properly and a confirmation message has been sent to the customer!</description>
<response>000</response>
<pointsCredited>600</ pointsCredited>
<membershipNo>2387483748</ membershipNo >
<transactionId/> */}

// "paymentRef": response.paymentRef,
// "isRetry": response.isRetry,
// "isReversal": response.isReversal






