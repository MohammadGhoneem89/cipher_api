'use strict';
const pg = require('../../../../core/api/connectors/postgress');


async function getOrderTranxID(orderID) {
    const queryData = `SELECT "txnid" FROM orders  WHERE "tranxData" ->> 'orderID' = '${orderID}';`;
    try {
        const conn = await pg.connection();
        const result = await conn.query(queryData);
        return result.rows[0];
    } catch (error) {
        console.log("Error occurred while fetching transactionID for this order ", error);
        return error;
    }
}

exports.getOrderTranxID = getOrderTranxID;