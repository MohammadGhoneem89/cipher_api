'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getOrderDetails = function (payload, UUIDKey, route, callback, JWToken) {

    let queryOrderDetails = 'SELECT * FROM orderdetails WHERE key=$1::varchar LIMIT 1';

    console.log("===", queryOrderDetails)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(queryOrderDetails, [payload.internalid])
        ]).then((data) => {
            let response = {}
            if (JWToken.orgType == 'ECOMMERCE' && data[0].rows[0].tranxData.eCommerceOrgCode != JWToken.orgCode) {
                response = { "responseMessage": { "action": "getOrderDetails", "data": { "message": { "status": "Error", "errorDescription": "Access Not Allowed!!", "displayToUser": true, "newPageURL": "/courier/orderlist" } } } }
            }
            else {
                response = {
                    "getOrderDetails": {
                        "action": "getOrderDetails",
                        "data": {
                            "searchResult": data[0].rows[0]
                        }
                    }
                };
                
            }
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
}

