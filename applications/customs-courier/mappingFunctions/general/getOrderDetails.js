'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getOrderDetails = function (payload, UUIDKey, route, callback, JWToken) {

    let queryOrderDetails = 'SELECT * FROM orderdetail WHERE internalid=$1::int';

    console.log("===", queryOrderDetails)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(queryOrderDetails, [payload.internalid])
        ]).then((data) => {

            let response = {
                "getOrderDetails": {
                    "action": "getOrderDetails",
                    "data": {
                        "searchResult": data[0].rows[0]
                    }
                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
}

