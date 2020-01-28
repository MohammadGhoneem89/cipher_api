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

async function settleTransaction(payload, UUIDKey, route, callback, JWToken) {
    let db = pgModels.makeModel('transaction')
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
    //if (payload.body.searchCriteria.Status){
    obj.tranxData['"internalStatus"'] = {
        [Op.eq]: "CONFIRMED",
    }

    let response = await db.findAll({
        where: obj,
        raw: false,
        // limit: payload.body.page.pageSize,
        // offset: (payload.body.page.currentPageNo - 1)* payload.body.page.pageSize
    }).error((err) => {
        console.log("Error " + err)
        return callback(err)
    });

    if (response) {
        console.log("#### TRANSACTION RESPONSE ### ", response);
        return callback(response);
    }

    //inserting into settlements
    // let settlement = pgModels.makeModel('settlements')
    // const settlementObj = { tranxData: {} }
    // settlementObj.tranxData = { response };
    // let settlementResponse = await settlement.create(settlementObj).error((err) => {
    //     console.log("Error occurred while inserting in settlement !!! ", err);
    //     return callback(err);
    // })
    // console.log("\n\n >>> settlementResponse >>> ", settlementResponse);
    // if (settlementResponse) {
    //     console.log("settlementResponse ??? ", settlementResponse);
    //     return callback(settlementResponse);
    // }
}

exports.settleTransaction = settleTransaction;


