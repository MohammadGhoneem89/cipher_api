'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');
const fs = require('fs');
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

const config = require('../../../../config');



async function initiateSettlement(payload, UUIDKey, route, callback, JWToken) {

    try{


        let settlementID=UUIDKey+"_settlement"
        let transactionList=_.get(payload,"body.transactionList","")
        let count=_.get(payload,"body.transactionCount","")
        let toCode=_.get(payload,"body.toCode","")
        let fromCode=_.get(payload,"body.fromCode","")
        


        let queryData="INSERT INTO SettlementBatchInterimDetail (status, settlementId, TransactionID, createdAt, updatedAt,transactioncount, actualto, actualfrom) VALUES('INVALID'::character varying, '', '', '', '', 0, '', '');"




//console.log(tarray+"\n")
//tarray=[];



     /*   
        let pdatac={}
        let txid=_.get(payload,"body.key","")
        let processingType=_.get(payload,"body.processingType","")
        let loyaltyProgramCode=_.get(payload,"body.from","")
        let targetLoyaltyProgramCode=_.get(payload,"body.to","")
        let points=_.get(payload,"body.points","")
        let membershipNo=_.get(payload,"body.membershipNo","")
        _.set(pdatac,"errorReason","");
        _.set(pdatac,"errorDescription","");



      
      
        console.log("TXNID "+txid+"  processingType  "+processingType)
       let queryData="";
       let sign=""
       let isExecute=false;
      

     if (processingType.includes('REVERSEDEBIT')){
        sign="+"
        isExecute=true
        _.set(pdatac,"status","SUCCESS");
        //executeQuery(queryData)
    }else if (processingType.includes('REVERSECREDIT')){
        sign="-"
        isExecute=true
        _.set(pdatac,"status","SUCCESS");
        //executeQuery(queryData)
    }else if((txid.includes('_SS_') || txid.includes('_SF_') || txid.includes('_ST_')) && processingType.includes('DEBIT')){
            _.set(pdatac,"status","SUCCESS");
            sign="-"
            isExecute=true
            
        }else if(txid.includes('_F_')  && processingType.includes('DEBIT')){
            _.set(pdatac,"status","FAILURE");
            //sign="-"
            isExecute=false
            
        }else if(txid.includes('_T_')  && processingType.includes('DEBIT')){
            
            console.log("going for time out")
            _.set(pdatac,"status","TIMEOUT");
            sign="-"
            isExecute=true
            
        }else if (txid.includes('_SS_') && processingType.includes('CREDIT')){
       
            sign="+"
            _.set(pdatac,"status","SUCCESS");
            isExecute=true
        }else if (txid.includes('_SF_') && processingType.includes('CREDIT')){
            //sign="-"
            _.set(pdatac,"status","FAILURE");
            isExecute=false
        }else if (txid.includes('_ST_') && processingType.includes('CREDIT')){
            sign="+"
            _.set(pdatac,"status","TIMEOUT");
            isExecute=true
        }else if(processingType.includes('CREDIT')){
            sign="+"
            _.set(pdatac,"status","SUCCESS");
            isExecute=true
        }else if(processingType.includes('DEBIT')){
            _.set(pdatac,"status","SUCCESS");
            sign="-"
            isExecute=true
        }else{
            return callback({
                status: "failed",
                RESULT: "not found flow things",
                error: true
            })
           
        }
        

        let isPointsAvailable = await getLmsdata(loyaltyProgramCode,membershipNo,parseFloat(points));

        if(processingType=='DEBIT' && !isPointsAvailable ){
            _.set(pdatac,"status","FAILURE");
            _.set(pdatac,"errorReason","Point are not available")
            isExecute=false
           }


        queryData = `UPDATE LMS SET "currentpoints" = "currentpoints" ${sign} ${points} where 
        "program_name" = '${loyaltyProgramCode}' AND
         "membershipno"='${membershipNo}'`;
         if(isExecute){
             console.log("action+  "+ processingType+" Query "+queryData)
         executeQuery(queryData)
         }

        console.log(loyaltyProgramCode+"<<<<<<<<<")
     
       
                   _.set(pdatac,"targetLoyaltyProgramCode",targetLoyaltyProgramCode);
                    _.set(pdatac,"loyaltyProgramCode",loyaltyProgramCode);
                   _.set(pdatac,"transactionID",txid);
                   _.set(pdatac,"pointsAwarded",parseInt(points));
                    _.set(pdatac,"pointsDebited",parseInt(points));
                  // _.set(pdatac,"status","SUCCESS");
                   



                   let data = await confirmTransaction({}, pdatac);

                   return callback({
                    status: "success",
                    RESULT: data,
                    error: false
                })


*/

return callback({
    status: "success",
    RESULT: "error",
    error: false
})
    }catch(e){


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


function executeQuery(queryData){

    pg.connection().then((conn) => {
        console.log("Connected to DB successfully !")
        return Promise.all([
            conn.query(queryData, [])
        ]).then((data) => {})
    });
}

async function  getLmsdata(loyaltyProgramCode,membershipNo,points){
    const queryData = `select * from LMS where "program_name" = '${loyaltyProgramCode}' AND
    "membershipno"='${membershipNo}'`;
    try {
        const connection = await pg.connection();
        const queryResult = await connection.query(queryData);

        console.log("POINT AVAILABLE"+queryResult.rows[0].currentpoints+" Conversion required "+points)
        return queryResult.rows[0].currentpoints>=points
      //  console.log(">> data"+ JSON.stringify(queryResult.rows[0]))
       
    }catch(err){
console.log(err)
    }
}

function confirmTransaction(response, payload) {
    console.log("PAYLOADY=====================> ",
    payload, " <=====================PAYLOADY");
   
        let options = {
            method: 'POST',
            url: 'http://localhost:'+config.get("port")+'/API/SMILES/confirmTransaction',
            body:
            {
                header:
                {
                    "username": "Internal_API",
                    "password": "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
                },
                body: {
                    "loyaltyProgramCode": _.get(payload,"loyaltyProgramCode",""),
                    "targetLoyaltyProgramCode": _.get(payload,"targetLoyaltyProgramCode",""),
                    //"membershipNo": response.membershipNo,
                    "transactionType": "POINTCONVERSION",
                    "transactionID": _.get(payload,"transactionID",null),
                    "pointsAwarded": _.get(payload,"pointsAwarded",null),
                    "pointsDebited": _.get(payload,"pointsDebited",null),
                    "status":_.get(payload,"status",null),
                    "errorReason": _.get(payload,"errorReason",null),
                    "errorDescription": _.get(payload,"errorDescription",null),
                }

            },
            json: true
        };
         console.log("REQUEST===============>", options.body, "<===============REQUEST");
        return rp(options);
    
}
exports.initiateSettlement = initiateSettlement