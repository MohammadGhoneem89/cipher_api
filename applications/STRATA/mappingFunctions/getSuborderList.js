'use strict';
const pg = require('../../../core/api/connectors/postgress');
const _ = require('lodash');
const { getOrgDetail } = require('../../../core/Common/buissnessFunction/instrument');

function getSubOrderList(payload, UUIDKey, route, callback, JWToken) {

    let queryData = `SELECT "tranxData","txnid" FROM suborders  WHERE 1=1`;
    let queryCnt = `SELECT COUNT(*) FROM suborders  WHERE 1=1`;
    let query = '';

    if (payload.body.searchCriteria && payload.body.searchCriteria.subOrderID) {
        let subOrderID = payload.body.searchCriteria.subOrderID;
        query += ` AND "tranxData" ->> 'subOrderID' = '${subOrderID}' `;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.orderID) {
        let orderID = payload.body.searchCriteria.orderID;
        query += ` AND "tranxData" ->> 'orderID' = '${orderID}' `;
    }

    if (payload.body.searchCriteria && payload.body.searchCriteria.status) {
        let status = payload.body.searchCriteria.status;
        query += ` AND "tranxData" ->> 'status' = '${status}' `;
    }

    let query_ = queryCnt + query;
    let queryCriteriaFull = queryData + query;

    if (payload.body.page) {
        queryCriteriaFull += ` limit ${payload.body.page.pageSize} 
    OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
    }
    console.log("queryCriteriaFull --->", queryCriteriaFull);
    pg.connection().then((conn) => {
        console.log("Connected to DB....!!");
        return Promise.all([
                conn.query(query_, []),
                conn.query(queryCriteriaFull, [])
            ]).then((data) => {
                let result = [];

                if (data) {
                    let info = data[1].rows;
                    for (let i in info) {
                        data[1].rows[i].tranxData.trxid = data[1].rows[i].txnid;
                    }
                    _.get(_.get(data, '[1]', {}), 'rows', []).forEach((elemt) => {
                        result.push(elemt.tranxData);

                    });

                    ParseDataforSuborder(JWToken, result.length > 0 ? result[0].supplierID : '').then((res) => {
                        console.log(res, "===== result")
                        result.forEach((ele) => {
                            ele.entityName = res[0];
                            ele.entityLogo = res[1];
                        })

                        let response = {
                            "getSubOrderList": {
                                "action": "getSubOrderList",
                                "pageData": {
                                    "pageSize": payload.body.page ? payload.body.page.pageSize : undefined,
                                    "currentPageNo": payload.body.page ? payload.body.page.currentPageNo : 1,
                                    "totalRecords": data[0].rows[0].count
                                },

                                "searchResult": result

                            }
                        };
                        console.log(response);
                        return callback(response);
                    })
                }
            })
            .catch((err) => {
                console.log("Error occurred while executing query..!!", err);
                return callback(err);
            });
    });
}

exports.getSubOrderList = getSubOrderList;

async function ParseDataforSuborder(jwt, supplierID) {
    console.log('==================================', supplierID)
    let entityName, entityLogo;
    let promisesList = [getOrgDetail(supplierID, jwt)]
    let promisesResult = await Promise.all(promisesList)
    let entity = _.get(promisesResult[0], "entityList.data.searchResult", undefined)
    if (entity && entity.length) {
        let entityData = entity[0] || undefined;
        if (entityData && !_.isEmpty(entityData)) {
            entityName = _.get(entityData, "entityName.name", "");
            entityLogo = _.get(entityData, "entityLogo.sizeSmall", "");
        }
    }
    return [entityName, entityLogo];

}