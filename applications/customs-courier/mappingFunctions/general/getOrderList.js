'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const dates = require('../../../../lib/helpers/dates');
const _ = require('lodash');

exports.getOrderList = function (payload, UUIDKey, route, callback, JWToken) {

    let params = []
    let queryData = 'SELECT internalid, "tranxData" FROM orderdetail ';
    let queryCnt = 'SELECT COUNT(*) FROM orderdetail ';

    if (payload.searchCriteria) {
        if (payload.searchCriteria.filename != "") {
            queryData += 'WHERE name=$1::varchar '
            queryCnt += 'WHERE name=$1::varchar '
            params.push(payload.searchCriteria.filename)
        }
    }
    // queryData += ' ORDER BY \'updatedAt\' DESC';

    if (payload.page) {
        queryData += ` limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
    }


    console.log("+++", queryData)
    console.log("---", queryCnt)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(queryData, params),
            conn.query(queryCnt, params),
        ]).then((data) => {

            let outVal = [];
            data[0].rows.forEach((elemt) => {
                let element = {}
                element.orderID = elemt.tranxData.orderID
                element.HAWBNo = _.get(elemt.tranxData, "ExportHAWBList[0].HAWBNumber", "")
                element.orderDate = elemt.tranxData.eCommerceOrgCode
                element.courierOrgCode =  elemt.tranxData.eCommerceOrgCode
                element.eCommerceOrgCode = elemt.tranxData.eCommerceOrgCode
                element.shipTo = _.clone(elemt.tranxData.shipTo)
                element.orderStatus = _.clone(elemt.tranxData.orderStatus)
                element.action = [{ "value": "1003", "type": "componentAction", "label": "View", "params": "", "iconName": "icon-docs", "URI": ["/courier/orderDetails/"] }]
                outVal.push(element);
            })

            let response = {
                "orderlist": {
                    "action": "orderlist",
                    "pageData": {
                        // "pageSize": _.get(payload, pageSize, 1),
                        // "currentPageNo": payload.page.currentPageNo,
                        "totalRecords": data[1].rows[0].count
                    },
                    "data": {
                        "searchResult": {
                            orderList: outVal
                        }
                    }
                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
}

