'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');
const sequelize = require('sequelize');
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
    try{
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

let db = await pgModels.makeModel('transactions')
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
order:  [
    [Sequelize.literal(`"transactions"."block_num"`), "DESC"],
  ],
raw: false,
limit: payload.body.page.pageSize,

offset: (payload.body.page.currentPageNo - 1) * payload.body.page.pageSize,

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
"URI": [`/smiles/transaction/view/${row.tranxData.partnerCode}/${row.tranxData.withPartnerCode}`]
}];
row.dataValues.actions = actions

row.dataValues.transactionId=`${row.tranxData.partnerCode}_${row.tranxData.sourceTransactionId}`
});



if (result) {
result.rows = rows;
response.getPointConversionTransactionList.data.searchResult = result
response.getPointConversionTransactionList.pageData.currentPageNo = payload.body.page.currentPageNo
response.getPointConversionTransactionList.pageData.pageSize = payload.body.page.pageSize
return callback(response);
}


}catch(e){
    console.log(e.stack)
    callback({"success":false});
}


}
exports.getPointConversionTransactionList = getPointConversionTransactionList