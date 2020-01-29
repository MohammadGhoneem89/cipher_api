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

async function getPointConversionTransactionList(payload, UUIDKey, route, callback, JWToken) {
    let response = {
        "getPointConversionTransactionList": {
            "action": "getPointConversionTransactionList",
            "pageData": {
                "currentPageNo": 1,
                "pageSize": 10
            },
            "data": {
                "searchResult": {}
            }
        }
    }

    let db = pgModels.makeModel('transaction')
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
    let actions = {
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": ["/View/Detail/"]
    }

  

    let rows = _.get(result, 'rows', null)

    console.log('-----',rows[0])
    if (rows) {
        rows.forEach((row, index) => {
            rows[index].dataValues.actions =actions
        });
    }

    // let arr = _.get(result,'rows',null)
    // arr.forEach(element => {
    //     arr(element).push(actions)
    // });
    if (result) {

        response.getPointConversionTransactionList.data.searchResult = rows
        response.getPointConversionTransactionList.pageData.currentPageNo = payload.body.page.currentPageNo
        response.getPointConversionTransactionList.pageData.pageSize = payload.body.page.pageSize
        return callback(response);
    }





}
exports.getPointConversionTransactionList = getPointConversionTransactionList