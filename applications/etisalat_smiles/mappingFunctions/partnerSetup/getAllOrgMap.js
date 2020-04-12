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

async function getAllOrgMap(payload, UUIDKey, route, callback, JWToken) {
    let response = {
        "getAllOrgMap": {
            "data": {
                "searchResult": {}
            }
        }
    }

    let db = await pgModels.makeModel('orgcodemapping')
    const obj = {
        tranxData: {
        }
    }

    let tranxData = {}

    let transData = []

    let obj1
    // let result = await 
    let result = await db.findAndCountAll({
        where: obj,
        raw: false,

    }).error((err) => {
        console.log("Error " + err)
        return callback(err)
        
    });

    let { rows: resultRows = [] } = result;
    let Mapping = resultRows.map(obj => {
        let arr = obj.tranxData.mapData
        arr.forEach((elem)=> {

            transData.push(elem)

        });


        return tranxData
    });

    transData.forEach(elem => {
        let actions = [{
            label: "View",
            iconName: "fa fa-view",
            params: "_id",
            actionType: "COMPONENT_FUNCTION"
        }];
        elem.actions = actions
    });

    // console.log(transData)

    if (result) {
        // result.rows = rows;
        response.getAllOrgMap.data.searchResult = transData
        console.log("\n\n RES >> ", response.getAllOrgMap.data.searchResult)
        return callback(response);
    }





}
exports.getAllOrgMap = getAllOrgMap