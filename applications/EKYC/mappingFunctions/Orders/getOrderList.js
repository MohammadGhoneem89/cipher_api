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
const pgModels = require('./PostgreModel.js')
var filename = "";
const { Op } = require("sequelize");

async function getOrderList(payload, UUIDKey, route, callback, JWToken) {
    let response = {
        "getOrderList": {
            "action": "getOrderList",
            "pageData": {
                "currentPageNo": 1,
                "pageSize": 10
            },
            "data": {
                "searchResult": {}
            }
        }
    }

    let db = pgModels.makeModel('orders')
    const obj = {
        tranxData: {
        }
    }

    //CONDITIONS TO BE ADDED BASED ON SEARCH CRITERIA PROVIDED
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
    
    //QUERY FOR FECTHING LISTS
    let result = await db.findAndCountAll({
        where: obj,
        raw: false,
        limit: payload.body.page.pageSize,
        offset: (payload.body.page.currentPageNo - 1) * payload.body.page.pageSize
    }).error((err) => {
        console.log("Error " + err)
        return callback(err)
    });
    
    // let finalObject = [];
    // if (result && result.length) {
    //     for (let elem of result) {
    //         console.log('\n\n\n\n\n', elem, '\n\n\n\n\n');
    //         if (elem.tranxData && Object.keys(elem.tranxData).length) {
    //             let tranxData = { ...elem.tranxData }
    //             finalObject.push({
    //                 ...tranxData,
    //                 sourceTransactionId: tranxData.sourceTransactionId,
    //                 accountNo: tranxData.accountNo,
    //                 points: _.get(tranxData, 'accrual[0].points', null)
    //             })
    //         }
    //     }
    // }

    if (result) {
        response.getPointConversionTransactionList.data.searchResult = result
        response.getPointConversionTransactionList.pageData.currentPageNo = payload.body.page.currentPageNo
        response.getPointConversionTransactionList.pageData.pageSize = payload.body.page.pageSize
        return callback(response);
    }
    // return callback(result)
}

exports.getPointConversionTransactionList = getPointConversionTransactionList


