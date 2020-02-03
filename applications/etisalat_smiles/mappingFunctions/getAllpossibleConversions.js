'use strict';
const pg = require('../../../core/api/connectors/postgress');
const moment = require('moment');
const timestamp = moment().format('DD/MM/YYYY HH:mm:ss a');
async function getAllPossibleConversionConfig(payload, UUIDKey, route, callback, JWToken) {
    let result = [];
    const queryData = `select 
    "tranxData"->>'contractParams' as "contractParams",
    "tranxData"->>'partnerCode' as "partnerCode",
    "tranxData"->>'partnerErCode' as "fromToken",
    "tranxData"->>'fromConversionFactor' as "fromRate"
    from interims where 
    "tranxData"->>'isPointConversionPartner' = 'true';`
    try {
        const connection = await pg.connection();
        const queryResult = await connection.query(queryData);
        const pointConvpartners = queryResult.rows;
        console.log("\n\n >> Query result >> ", pointConvpartners);
        for (let j = 0; j < pointConvpartners.length; j++) {
            let conversionsRates = [];
            let conversion = [];
            let keys = [];
            let contractParams = JSON.parse(pointConvpartners[j].contractParams);
            for (const k in contractParams) { keys.push(k) }; // get all keys from contractParam object
            for (const key of keys) { //fetch all conversionBillingRates at this key
                conversionsRates = contractParams[key].conversionBillingRates;
                for (let i = 0; i < conversionsRates.length; i++) {
                    conversion.push({
                        endDate: conversionsRates[i].endDate,
                        toFromRate: conversionsRates[i].rate,
                        toToken: conversionsRates[i].sourceToken,
                        startDate: conversionsRates[i].startDate,
                        authMethod: contractParams[key].authMethod,
                        convType: contractParams[key].convType,
                        toOrg: contractParams[key].withPartnerCode

                    });
                }
            }
            result.push({
                fromOrg: pointConvpartners[j].partnerCode,
                fromToken: pointConvpartners[j].fromToken,
                fromToRate: parseFloat(pointConvpartners[j].fromRate),
                conversionConfig: conversion
            });
        }
        return callback({
            messageStatus: "Processed OK!",
            errorCode: 200,
            errorDescription: "",
            timestamp,
            "conversionConfigurations": result
        });
    }
    catch (error) {
        console.log("Error occurred while executing query! ", error);
        return callback({
            messageStatus: "ERROR",
            errorCode: 201,
            errorDescription: error,
            timestamp,
            conversionConfigurations: [],
        });
    }
}

exports.getAllPossibleConversionConfig = getAllPossibleConversionConfig;