'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');
const fs = require('fs');
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

async function getPointConversionTransactionList(payload, UUIDKey, route, callback, JWToken) {
UUIDKey
    try{
    let response = {
        "messageStatus": "OK",
        "messageId": UUIDKey,
        "errorDescription": "",
        "errorCode": 200,
        "timestamp": EpochToDate(dates.newDate()),
        
      
           "pageNo":0,
           "totalNoOfRecords":0,
            "result":{
            "transactions":{}

            
            
        }
    }

    let db = await pgModels.makeModel('transactions')
    const obj = {
        tranxData: {
        }
    }

    if (payload.body.startDate && payload.body.endDate) {
        obj.tranxData['lastUpdateTimestamp'] = {
            [Op.gte]: dates.ddMMyyyyHHmmSSMS(payload.body.startDate),
            [Op.lte]: dates.ddMMyyyyHHmmSSMS(payload.body.endDate)
        }
    }

    if (payload.body.loyaltyProgramCode) {
        obj.tranxData['"partnerCode"'] = {
            [Op.eq]: payload.body.loyaltyProgramCode,
        }
    }

    if (payload.body.membershipNo) {
        obj.tranxData['"membershipNo"'] = {
            [Op.eq]: payload.body.membershipNo,
        }
    }


    if (payload.body.transactionType) {
        obj.tranxData['"transactionType"'] = {

            
            [Op.eq]: payload.body.transactionType=="C"?"POINTCONVERSION":payload.body.transactionType,
        }
    }
    if (payload.body.partnerCode) {
        obj.tranxData['"withPartnerCode"'] = {
            [Op.eq]: payload.body.partnerCode
        }
    }


    let obj1
    // let result = await 
    let result = await db.findAndCountAll({
        where: obj,
        raw: false,
        limit: payload.body.pageSize,
        offset: (payload.body.pageNo - 1) * payload.body.pageSize
    }).error((err) => {
        console.log("Error " + err)
        return callback(err)
    });




    

    let rows = _.get(result, 'rows', [])

    let count=result.count
   // console.log("Initial Role"+JSON.stringify(result))

    let data=[]
    rows.forEach((row) => {

      var obj={};
      obj['transactionType']=row.tranxData.transactionType=="POINTCONVERSION"?"C":"";
      obj['transactionSubType']=row.tranxData.transactionSubType;
      obj['sourceLoyaltyProgram']=row.tranxData.partnerCode;
      obj['sourcemembershipNo']=row.tranxData.membershipNo;
      obj['targetLoyaltyProgram']=row.tranxData.withPartnerCode;
      obj['targetmembershipNo']=row.tranxData.conversionParams.targetMemberShipNo;
      obj['pointsConverted']=row.tranxData.conversionParams.pointsToBeConverted;
      obj['transactionDate']=EpochToDate(row.tranxData.createdOn);
      obj['status']=row.tranxData.internalStatus;
      data.push(obj)
      
      
        let actions = [{
            "value": "1003",
            "type": "componentAction",
            "label": "View",
            "params": "",
            "iconName": "icon-docs",
            "URI": [`/smiles/transaction/view/${row.tranxData.partnerCode}/${row.tranxData.withPartnerCode}`]
        }];
        //row.dataValues.actions = actions
        
       // row.dataValues.transactionId=`${row.tranxData.partnerCode}_${row.tranxData.sourceTransactionId}`
    });



    if (result) {
        result.transactions = data;
        response.result.transactions = data
        response.totalNoOfRecords = count
        response.pageNo = payload.body.pageNo
        return callback(response);
    }

    function EpochToDate(epoch) {
        if (epoch < 10000000000)
            epoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
        var epoch = epoch + (new Date().getTimezoneOffset() * -1); //for timeZone        
        return new Date(epoch);
    }

    }catch(e){


        response = {
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
exports.getPointConversionTransactionList = getPointConversionTransactionList