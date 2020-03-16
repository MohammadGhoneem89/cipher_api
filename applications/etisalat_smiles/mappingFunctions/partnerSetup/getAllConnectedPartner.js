'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');
const fs = require('fs');
const { resolve, basename, dirname } = require('path');
const events = require('events').EventEmitter;
const emitter = new events.EventEmitter();
const skipBottomLines = 0;
const skipLines = 1;
const Sequelize = require('sequelize');
const pgModels = require('../SETTLEMENT/settlmentModel.js')
var filename = "";
const { Op } = require("sequelize");

async function getAllConnectedPartner(payload, UUIDKey, route, callback, JWToken) {
    let response = {
        "data": {
            "partners": {
            }
        }
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







    let rows = _.get(result, 'rows', [])
    rows.forEach((row) => {

        let actions = [{
            "value": "1003",
            "type": "componentAction",
            "label": "View",
            "params": "",
            "iconName": "icon-docs"
            // "URI": [`/smiles/settlement/view/${row.tranxData.partenerCode}/${row.tranxData.withPartenerCode}`]
        }];
        row.dataValues.actions = actions

        row.dataValues.transactionId = `${row.tranxData.key}`
    });
    // response.searchResult[]

    let tranxData = {}


    let { rows: resultRows = [] } = result;
    let partners = resultRows.map(obj => {
        tranxData.sourceLoyaltyProgramCode = obj.tranxData.partnerCode

        for (var key in obj.tranxData.contractParams) {
            //set targetLoyalty here   
            tranxData.targetLoyaltyProgramCode = key
            var obj1 = obj.tranxData.contractParams[key].conversionBillingRates
            tranxData.linkingParam = obj.tranxData.contractParams[key].authMethod
            obj1.forEach((elem) => {
                tranxData.startDate = elem.startDate
                tranxData.endDate = elem.endDate
                tranxData.conversionRate = elem.rate

            })
        }

        tranxData.feeType = ""
        tranxData.feeValue = ""

        return tranxData
    });


    console.log(partners);




    if (result) {
        result.rows = rows;
        response.data.partners = partners
        // response.getAllConnectedPartner.pageData.currentPageNo = payload.body.page.currentPageNo
        // response.getAllConnectedPartner.pageData.pageSize = payload.body.page.pageSize
        return callback(response);
    }
}
exports.getAllConnectedPartner = getAllConnectedPartner