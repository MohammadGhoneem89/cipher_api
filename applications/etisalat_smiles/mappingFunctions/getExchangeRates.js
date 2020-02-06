'use strict';
const pg = require('../../../core/api/connectors/postgress');
const moment = require('moment');
const timestamp = moment().format('DD/MM/YYYY HH:mm:ss a');

async function getExchangeRates(payload, UUIDKey, route, callback, JWToken) {
    const queryData = `select 
       "tranxData" ->>'orgCode' as "orgCode",
        "tranxData" ->>'tokenCode' as "tokenCode",
        "tranxData" ->>'rate' as "rate",
        "tranxData" ->>'currencyCode' as "currencyCode"
        from public."exchangeRates";`;
    try {
        const connection = await pg.connection();
        const queryResult = await connection.query(queryData);
        const exchangeRates = queryResult.rows;
        console.log("\n\n >> Query result >> ", exchangeRates);
        return callback({
            messageStatus: "Processed OK!",
            errorCode: 200,
            errorDescription: "",
            timestamp,
            getExchangeRates: {
                action: "getExchangeRates",
                exchangeRates
            }
        });
    }
    catch (err) {
        console.log("Error occurred while executing query..! ", err);
        return callback({
            messageStatus: "ERROR",
            errorCode: 201,
            errorDescription: err,
            timestamp,
            getExchangeRates: {
                action: "getExchangeRates",
                exchangeRates: []
            }
        });
    };
}

exports.getExchangeRates = getExchangeRates