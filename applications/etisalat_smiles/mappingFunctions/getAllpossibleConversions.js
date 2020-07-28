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
    from partners where 
    "tranxData"->>'isPointConversionPartner' = 'true';`
    try {
        const connection = await pg.connection();
        const queryResult = await connection.query(queryData);
        const pointConvpartners = queryResult.rows;
        const pointConvpartnerlength = pointConvpartners.length;
        const response = {
            messageStatus: "ERROR",
            errorCode: 201,
            errorDescription: error,
            timestamp,
            conversionConfigurations: [],
        }
        console.log("\n\n >> Query result >> ", pointConvpartners);

        for (let j = 0; j < pointConvpartnerlength; j++) {
            let pConv = pointConvpartners[j];
            let conversionsRates = [];
            let conversion = [];
            let keys = [];
            let contractParams = JSON.parse(pConv.contractParams);
            for (const k in contractParams) { keys.push(k) }; // get all keys from contractParam object
            for (const key of keys) { //fetch all conversionBillingRates at this key
                let eachContrctParam = contractParams[key];
                conversionsRates = eachContrctParam.conversionBillingRates;
                const conversionsRateslength = conversionsRates.length;
                for (let i = 0; i < conversionsRateslength; i++) {
                    let conRt=conversionsRates[i];
                    conversion.push({
                        endDate: conRt.endDate,
                        toFromRate: conRt.rate,
                        toToken: conRt.sourceToken,
                        startDate: conRt.startDate,
                        authMethod: eachContrctParam.authMethod,
                        convType: eachContrctParam.convType,
                        toOrg: eachContrctParam.withPartnerCode

                    });
                }
            }
            result.push({
                fromOrg: pConv.partnerCode,
                fromToken: pConv.fromToken,
                fromToRate: parseFloat(pConv.fromRate),
                conversionConfig: conversion
            });

        }
        response.messageStatus = "Processed OK!";
        response.errorCode = 200;
        response.errorDescription = "";
        response.conversionConfigurations = result;
        return callback(response);
    }
    catch (error) {
        console.log("Error occurred while executing query! ", error);
        response.conversionConfigurations = [];
        return callback(response);
    }
}

exports.getAllPossibleConversionConfig = getAllPossibleConversionConfig;