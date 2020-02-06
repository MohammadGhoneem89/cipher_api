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
const pgModels = require('./settlmentModel.js')
var filename = "";
const { Op } = require("sequelize");

async function getSettlementList(payload, UUIDKey, route, callback, JWToken) {
    let response = {
        "getSettlementList": {
            "action": "getSettlementList",
            "pageData": {
                "currentPageNo": 1,
                "pageSize": 10
            },
            "data": {
                "searchResult": {}
            }
        }
    }

    let db = pgModels.makeModel('Settlements')
    const obj = {
        tranxData: {
        }
    }

    if (payload.body.searchCriteria.startDate && payload.body.searchCriteria.endDate) {
        obj.tranxData['"transactionDate"'] = {
            [Op.gte]: payload.body.searchCriteria.startDate,
            [Op.lte]: payload.body.searchCriteria.endDate
        }
    }

    if (payload.body.searchCriteria.Status) {
        obj.tranxData['"internalStatus"'] = {
            [Op.eq]: payload.body.searchCriteria.Status,
        }
    }
    if (payload.body.searchCriteria.Partner) {
        obj.tranxData['"partnerCode"'] = {
            [Op.eq]: payload.body.partnerCode
        }
    }

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
            "iconName": "icon-docs",
            "URI": [`/smiles/settlement/view/${row.tranxData.partenerCode}/${row.tranxData.withPartenerCode}`]
        }];
        row.dataValues.actions = actions
        
        row.dataValues.transactionId=`${row.tranxData.key}`
    });



    if (result) {
        result.rows = rows;
        response.getSettlementList.data.searchResult = result
        response.getSettlementList.pageData.currentPageNo = payload.body.page.currentPageNo
        response.getSettlementList.pageData.pageSize = payload.body.page.pageSize
        return callback(response);
    }





}
exports.getSettlementList = getSettlementList