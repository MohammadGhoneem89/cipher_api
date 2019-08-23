'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getOrderDetails = function (payload, UUIDKey, route, callback, JWToken) {

    let queryOrderDetails = 'SELECT * FROM orderdetails WHERE key=$1::varchar  LIMIT 1';

    console.log("===", queryOrderDetails)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(queryOrderDetails, [payload.internalid])
        ]).then((data) => {


            let response = {}
            if (JWToken.orgType == 'ECOMMERCE' && data[0].rows[0].tranxData.eCommerceOrgCode != JWToken.orgCode) {
                response = { "responseMessage": { "action": "getOrderDetails", "data": { "message": { "status": "Error", "errorDescription": "Access Not Allowed!!", "displayToUser": true, "newPageURL": "/courier/orderlist" } } } }
            }
            let recordData = data[0].rows[0]
            if (recordData.tranxData.isConsolidated == true) {

                console.log("is Consoli ", recordData.tranxData.consolidatedId)
                pg.connection().then((conn) => {
                    return Promise.all([
                        conn.query(`select * from consolidateds where key='${recordData.tranxData.consolidatedId}'`, [])
                    ]).then((dataCons) => {
                        let declerationList = _.get(dataCons[0], 'rows[0].tranxData.declerationList', [])
                        _.set(recordData.tranxData, 'exportDeclaration', declerationList)
                        let response = {
                            "getOrderDetails": {
                                "action": "getOrderDetails",
                                "data": {
                                    "searchResult": recordData
                                }
                            }
                        }
                        return callback(response)
                    });
                });
            } else {
                console.log("not ConsoliDated ", recordData.tranxData.consolidatedId)
                let response = {
                    "getOrderDetails": {
                        "action": "getOrderDetails",
                        "data": {
                            "searchResult": recordData
                        }
                    }
                }
                return callback(response)
            }
        });
    });
}

