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
const pgModels = require('../PostgreModel.js')
var filename = "";
const { Op } = require("sequelize");

async function getTransactionList(payload, UUIDKey, route, callback, JWToken) {

    let response = {
        "getTransactionList": {
            "action": "getTransactionList",
            "pageData": {
                "currentPageNo": 0,
                "pageSize": 0,
                "totalRecords": 0
            },
            "searchResult": []
        }
    }
    let db = await pgModels.makeModel('transactions')

    const obj = {
        tranxData: {
        }
    }
    if (payload.body.searchCriteria.startDate && payload.body.searchCriteria.endDate) {
        obj.tranxData['"createdOn"'] = {
            [Op.gte]: payload.body.searchCriteria.startDate,
            [Op.lte]: payload.body.searchCriteria.endDate
        }
    }
    if (payload.body.searchCriteria.internalStatus) {
        obj.tranxData['"internalStatus"'] = {
            [Op.eq]: payload.body.searchCriteria.internalStatus,
        }
    }
    if (payload.body.searchCriteria.partnerCode) {
        obj.tranxData['"partnerCode"'] = {
            [Op.eq]: payload.body.searchCriteria.partnerCode
        }
    }
    if (payload.body.searchCriteria.withPartnerCode) {
        obj.tranxData['"withPartnerCode"'] = {
            [Op.eq]: payload.body.searchCriteria.withPartnerCode
        }
    }

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
    let count = result.count


    if (result) {
        response.getTransactionList.searchResult = rows;
        response.getTransactionList.pageData.currentPageNo = payload.body.page.currentPageNo
        response.getTransactionList.pageData.pageSize = payload.body.page.pageSize
        response.getTransactionList.pageData.totalRecords = count
        return callback(response);
    }
    
}

exports.getTransactionList = getTransactionList


