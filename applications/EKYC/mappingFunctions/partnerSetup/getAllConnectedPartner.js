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
const pgModels = require('../SETTLEMENT/settlmentModel.js')
var filename = "";
const { Op } = require("sequelize");

async function getAllConnectedPartner(payload, UUIDKey, route, callback, JWToken) {
    let response = {
        "messageStatus": "OK",
        "messageId": UUIDKey,
        "errorDescription": "",
        "errorCode": 200,
        "timestamp": dates.newDate(),
        partners: {}
    }


    let db = await pgModels.makeModel('partners')
    const obj = {
        tranxData: {
        }
    }

    // if (payload.body.searchCriteria.startDate && payload.body.searchCriteria.endDate) {
    //     obj.tranxData['"transactionDate"'] = {
    //         [Op.gte]: payload.body.searchCriteria.startDate,
    //         [Op.lte]: payload.body.searchCriteria.endDate
    //     }
    // }

    // if (payload.body.searchCriteria.Status) {
    //     obj.tranxData['"internalStatus"'] = {
    //         [Op.eq]: payload.body.searchCriteria.Status,
    //     }
    // }
    // if (payload.body.searchCriteria.Partner) {
    //     obj.tranxData['"partnerCode"'] = {
    //         [Op.eq]: payload.body.partnerCode
    //     }
    // }

    let obj1
    // let result = await 
    let result = await db.findAndCountAll({
        where: obj,
        raw: false,
        limit: payload.body.page.pageSize,
        offset: (payload.body.page.currentPageNo - 1) * payload.body.page.pageSize
    }).error((err) => {
        console.log("Error " + err)
        return callback(err)
    });







    // let rows = _.get(result, 'rows', [])
    // rows.forEach((row) => {

    //     let actions = [{
    //         "value": "1003",
    //         "type": "componentAction",
    //         "label": "View",
    //         "params": "",
    //         "iconName": "icon-docs"
    //         // "URI": [`/smiles/settlement/view/${row.tranxData.partenerCode}/${row.tranxData.withPartenerCode}`]
    //     }];
    //     row.dataValues.actions = actions

    //     row.dataValues.transactionId = `${row.tranxData.key}`
    // });
    // response.searchResult[]

    let arr = []
    let data = {}


    let { rows: resultRows = [] } = result;
    // console.log (resultRows)

    let partners = resultRows.map(ptnr => {
        // console.log(ptnr.tranxData)
        data.sourceLoyaltyProgramCode = ""
        if (ptnr.tranxData.contractParams != null) {
            for (let key in ptnr.tranxData.contractParams) {
                if (ptnr.tranxData.contractParams[key].isPointConversionPartner != false) {
                    data.targetLoyaltyProgramCode = ptnr.tranxData.contractParams[key].conversionPartnerProgramName || "" 
                    data.logo = ptnr.tranxData.contractParams[key].logo || ""
                    data.linkingParam = ptnr.tranxData.contractParams[key].authType || ""
                    data.termsAndConditions = ptnr.tranxData.contractParams[key].termsandConditionsEn
                    data.minConversion = ptnr.tranxData.contractParams[key].minPoints || 0

                    let obj = ptnr.tranxData.contractParams[key].conversionBillingRates
                    // console.log("contractParams: ", obj)
                    obj.forEach(elem => {
                        data.sourceLoyaltyProgramCode = elem.sourceToken
                        data.startDate = EpochToDate(elem.startDate)
                        data.endDate = EpochToDate(elem.endDate)
                        data.conversionRate = elem.rate || 0.00
                    })
                    data.feeType = ""
                    data.feeValue = 0
                    console.log(data)
                    arr.push({...data})
                    console.log(arr)
                }

            }
        }
        return data

    })


    // let partners = resultRows.map(obj => {
    //     tranxData.sourceLoyaltyProgramCode = obj.tranxData.partnerCode

    //     // console.log(obj)
    //     for (var key in obj.tranxData.contractParams) {
    //         if (obj.tranxData.contractParams[key].isPointConversionPartner == false) {
    //             return null
    //         }
    //         tranxData.termsAndCondtions = obj.tranxData.contractParams[key].termsandConditionsAr
    //         tranxData.minConversion = obj.tranxData.contractParams[key].minPoints
    //         //set targetLoyalty here   
    //         tranxData.targetLoyaltyProgramCode = key
    //         var obj1 = obj.tranxData.contractParams[key].conversionBillingRates
    //         tranxData.linkingParam = obj.tranxData.contractParams[key].authMethod
    //         obj1.forEach((elem) => {
    //             tranxData.startDate = EpochToDate(elem.startDate)
    //             tranxData.endDate = EpochToDate(elem.endDate)
    //             tranxData.conversionRate = elem.rate


    //         })
    //     }


    //     tranxData.feeType = ""
    //     tranxData.feeValue = ""

    //     return tranxData
    // });


    // console.log(partners);

    arr = arr.filter(word => word != null)



    if (result) {
        // result.rows = rows;
        response.partners = arr
        // response.getAllConnectedPartner.pageData.currentPageNo = payload.body.page.currentPageNo
        // response.getAllConnectedPartner.pageData.pageSize = payload.body.page.pageSize
        return callback(response);
    }
}

function EpochToDate(epoch) {
    if (epoch < 10000000000)
        epoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
    var epoch = epoch + (new Date().getTimezoneOffset() * -1); //for timeZone        
    return new Date(epoch);
}

exports.getAllConnectedPartner = getAllConnectedPartner