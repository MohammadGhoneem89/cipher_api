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

    let obj1
    // let result = await 
    let result = await db.findAndCountAll({
        where: obj,
        raw: false,
    }).error((err) => {
        console.log("Error " + err)
        return callback(err)
    });

    let tranxData = {}


    var d = new Date(0);

    let { rows: resultRows = [] } = result;
    let partners = resultRows.map(obj => {
        tranxData.sourceLoyaltyProgramCode = obj.tranxData.partnerCode

        for (var key in obj.tranxData.contractParams) {
            if (obj.tranxData.contractParams[key].isPointConversionPartner == false) {
                return null
            }   //set targetLoyalty here   
            tranxData.targetLoyaltyProgramCode = key
            var obj1 = obj.tranxData.contractParams[key].conversionBillingRates
            tranxData.linkingParam = obj.tranxData.contractParams[key].authMethod
            obj1.forEach((elem) => {
                if (elem.startDate != "" && elem.endDate == "") {
                    tranxData.startDate = EpochToDate(elem.startDate)
                    tranxData.endDate = EpochToDate(elem.endDate)
                    tranxData.conversionRate = elem.rate
                }
                else {
                    return null
                }


            })
        }

        tranxData.feeType = ""
        tranxData.feeValue = ""

        return tranxData
    });

    partners = partners.filter(word => word != null)

    console.log(partners);




    if (result) {
        // result.rows = rows;
        response.data.partners = partners
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