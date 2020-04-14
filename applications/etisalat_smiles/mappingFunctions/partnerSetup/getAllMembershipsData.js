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

async function getAllMembershipsData(payload, UUIDKey, route, callback, JWToken) {
    let response = {
        "messageStatus": "OK",
        "messageId": UUIDKey,
        "errorDescription": "",
        "errorCode": 200,
        "timestamp": dates.newDate(),
        "otherPartners": {},
        "linkedPartners": {}
    }



    let db = await pgModels.makeModel('partners')
    const obj = {
        tranxData: {
        }
    }

    let db_2 = await pgModels.makeModel('linkedmember_verifieds')

    const obj2 = {
        tranxData: {
        }
    }

    if (payload.body.sourceLoyaltyProgramCode) {
        obj2.tranxData['"programCode"'] = {
            [Op.eq]: payload.body.sourceLoyaltyProgramCode
        }
    }
    if (payload.body.membershipNo) {
        obj2.tranxData['"membershipno"'] = {
            [Op.eq]: payload.body.membershipNo
        }
        flag = 1
    }



    let arr = []
    let data = {
        sourceLoyaltyProgramCode: "",
        targetLoyaltyProgramCode: "",
        logo: "",
        linkingParam: "",
        termsAndConditions: "",
        SO: {},
        OS: {}
    }
    let myMap = new Map()
    let linkedarr = []

    let lm = {
        sourceLoyaltyProgramCode: "",
        targetLoyaltyProgramCode: "",
        linkingParam: "",
        startDate: "",
        endDate: "",
        conversionRate: "",
        termsAndCondtions: "",
        minConversion: "",
        feeType: "",
        feeValue: "",
        logo: "",
        OTPLength: "",
        status: "",
        points: ""
    }
    let lmarr = []
    let obj1
    // let result = await 
    let result = await db.findAndCountAll({
        where: obj,
        raw: false
    }).error((err) => {
        console.log("Error " + err)
        return callback(err)
    });

    let { rows: resultRows = [] } = result;
    let i = 0
    // console.log (resultRows)

    let partners = resultRows.map(ptnr => {
        // console.log(ptnr.tranxData)
        data.sourceLoyaltyProgramCode = ""
        if (ptnr.tranxData.contractParams != null) {
            for (let key in ptnr.tranxData.contractParams) {
                if (ptnr.tranxData.contractParams[key].isPointConversionPartner != false) {
                    data.targetLoyaltyProgramCode = ptnr.tranxData.contractParams[key].conversionPartnerProgramName || ""
                    data.logo = ptnr.tranxData.logo || ptnr.tranxData.contractParams[key].logo
                    data.linkingParam = ptnr.tranxData.contractParams[key].authType || ""
                    data.termsAndConditions = ptnr.tranxData.contractParams[key].termsandConditionsEn || ""
                    data.SO.minConversion = ptnr.tranxData.contractParams[key].minPoints || 0
                    data.unitType = ptnr.tranxData.contractParams[key].unitType || ""
                    data.validationRegEx = ptnr.tranxData.contractParams[key].validationRegEx || ""
                    if (typeof (data.minConversion) === "string") {
                        data.minConversion = parseInt(data.minConversion)
                    }
                    let obj = ptnr.tranxData.contractParams[key].conversionBillingRates
                    // console.log("contractParams: ", obj)
                    obj.forEach(elem => {
                        data.sourceLoyaltyProgramCode = elem.sourceToken
                        data.startDate = EpochToDate(elem.startDate) || ""
                        data.endDate = EpochToDate(elem.endDate) || ""
                        data.SO.conversionRate = elem.rate || 0.00                 //2 is OS, 1 is SO.
                        data.OS.conversionRate = elem.rate2 || 0.00
                        data.OS.minConversion = 0
                        data.SO.multipleOf = 0
                        data.OS.multipleOf = 0
                        data.SO.roundOffMethod = "Floor"
                        data.OS.roundOffMethod = "Ceiling"
                    })
                    data.feeType = ""
                    data.feeValue = 0
                    data.OTPLength = ptnr.tranxData.contractParams[key].OTPLength || 0
                    // console.log(data)
                    arr.push({ ...data })
                    // console.log(arr)
                }

            }
        }
        return data

    })

    arr = arr.filter(word => word != null && typeof (word) !== "undefined")
    let partArr = []

    console.log(arr)

    arr.forEach(obj => {
        // console.log(obj.targetLoyaltyProgramCode)
        myMap.set(obj.targetLoyaltyProgramCode, i)
        i++
    })

    let linked = await db_2.findAndCountAll({
        where: obj2,
        raw: false
    }).error((err) => {
        console.log("Error " + err)
        return callback(err)
    });

    let { rows: resultRows_link = [] } = linked;

    let linkedData = {}
    let linkedArr = []
    let linkMem = resultRows_link.map(link => {
        for (key in link.tranxData.linkedMembersDetails) {
                linkedData.targetLoyaltyProgramCode = link.tranxData.linkedMembersDetails[key].programCode  //change here programCode
                linkedData.targetMembershipNo = link.tranxData.linkedMembersDetails[key].linkedMembershipNo
                linkedData.points =  0
                linkedArr.push({ ...linkedData })
            
        }
        return linkedData
    })

    console.log("\n\n\n DATA >> ", linkedArr)
    let tempArr = [...arr]

    if (linkedArr.length > 0) {
        linkedArr.forEach(obj => {
            let index = myMap.get(obj.targetLoyaltyProgramCode)
            // console.log(typeof (index))
            if (!(typeof (index) === 'undefined') && index <= arr.length) {
                if (index >= 0) {
                    let temp = {}
                    temp = tempArr[index]
                    console.log("\n\nTARGET MEMBERSHIP >> ", index)
                    temp.targetMembershipNo = obj.targetMembershipNo
                    temp.points = obj.points
                    temp.status = "A"
                    partArr.push({ ...temp })
                    // console.log("here")
                    arr.splice(index, 1)
                    console.log("\n\n\n ARR>> ", arr)
                    console.log("\n\nLENGTH>> ", arr.length + "\n\n")
                    // console.log(arr + "\n\n")
                    myMap.set(obj.targetLoyaltyProgramCode, -1)
                }
            }
        })
    }




    if (result) {
        // result.rows = rows;
        response.otherPartners = arr
        response.linkedPartners = partArr

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

exports.getAllMembershipsData = getAllMembershipsData 