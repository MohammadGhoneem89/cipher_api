'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const dates = require('../../../../lib/helpers/dates');
const _ = require('lodash');

exports.getOrderList = function (payload, UUIDKey, route, callback, JWToken) {

    let params = []
    console.log(JWToken)
    let queryData = 'SELECT key, "tranxData"  FROM orderdetails WHERE 1=1 ';
    let queryCnt = 'SELECT COUNT(*) FROM orderdetails WHERE 1=1 ';

    if(JWToken.orgType == 'Courier') {
        queryData += `AND "tranxData"->>'courierOrgCode = '${JWToken.orgCode}'`
        queryCnt += `AND "tranxData"->>'courierOrgCode = '${JWToken.orgCode}'`
    }
    else if(JWToken.orgType == 'ECOMMERCE') {
        queryData += `AND "tranxData"->>'eCommerceOrgCode' = '${JWToken.orgCode}'`
        queryCnt += `AND "tranxData"->>'eCommerceOrgCode' = '${JWToken.orgCode}'`
    }

    if (payload.searchCriteria && payload.searchCriteria != undefined) {
        if(_.get(payload.searchCriteria, "ecommerce", "") != ""){
            let length = params.push(payload.searchCriteria.ecommerce);
            queryData += `AND "tranxData"->>'eCommerceOrgCode'=$${length}::varchar `;
            queryCnt += `AND "tranxData"->>'eCommerceOrgCode'=${length}::varchar `;
        }
        if(_.get(payload.searchCriteria, "courier", "") != ""){
            let length = params.push(payload.searchCriteria.courier);
            queryData += `AND "tranxData"->>\'courierOrgCode\'=$${length}::varchar `;
            queryCnt += `AND "tranxData"->>\'courierOrgCode\'=${length}::varchar `;
        }
        if(_.get(payload.searchCriteria, "orderNumber", "") != ""){
            let length = params.push(payload.searchCriteria.orderNumber);
            queryData += `AND "tranxData"->>\'orderID\'=$${length}::varchar `;
            queryCnt += `AND "tranxData"->>\'orderID\'=${length}::varchar `;
        }
        if(_.get(payload.searchCriteria, "declaration", "") != ""){
            let length = params.push(payload.searchCriteria.declaration);
            queryData += `AND "tranxData"->'exportDeclaration'->(0)->>'declarationNo'=$${length}::varchar `;
            queryCnt += `AND "tranxData"->'exportDeclaration'->(0)->>'declarationNo'=${length}::varchar `;
        }
        if(_.get(payload.searchCriteria, "hawbNumber", "") != ""){
            let length = params.push(payload.searchCriteria.hawbNumber);
            queryData += `AND "tranxData"->'ExportHAWB'->>'HAWBNumber'=$${length}::varchar `;
            queryCnt += `AND "tranxData"->'ExportHAWB'->>'HAWBNumber'=${length}::varchar `;
        }
        if(_.get(payload.searchCriteria, "mawbNumber", "") != ""){
            let length = params.push(payload.searchCriteria.mawbNumber);
            queryData += `AND "tranxData"->'ExportHAWBList'->(0)->'shippingDetails'->>'MAWBNumber'=$${length}::varchar `;
            queryCnt += `AND "tranxData"->'ExportHAWBList'->(0)->>'shippingDetails'->>'MAWBNumber'=${length}::varchar `;
        }
    }
    queryData += ' ORDER BY "updatedAt" DESC';

    if (payload.page) {
        queryData += ` limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
    }


    console.log("+++", queryData)
    console.log("---", queryCnt)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(queryData, params),
            conn.query(queryCnt, []),
        ]).then((data) => {

            let outVal = [];
            data[0].rows.forEach((elemt) => {
                let element = {}
                element.key = elemt.key;
                element.orderNumber = elemt.tranxData.orderID;
                element.hawbNumber = _.get(elemt.tranxData, "ExportHAWB.HAWBNumber", "");
                element.orderDate = elemt.tranxData.orderDate;
                element.courierCompanyName =  elemt.tranxData.courierOrgCode;
                element.ecommerceCompanyName = elemt.tranxData.eCommerceOrgCode;
                element.shipTo = elemt.tranxData.shipTo;
                element.orderStatus = elemt.tranxData.orderStatus;
                element.exportDeclarationStatus = _.get(elemt.tranxData, "exportDeclaration[0].status", "");
                element.importDeclarationStatus = _.get(elemt.tranxData, "importDeclaration[0].status", "");
                element.actions = [{ "value": "1003", "type": "componentAction", "label": "View", "params": "", "iconName": "icon-docs", "URI": ["/courier/orderDetails/"] }];
                outVal.push(element);
            })

            let response = {
                "orderlist": {
                    "action": "orderlist",
                    "pageData": {
                        "pageSize": _.get(payload, "pageSize", 10),
                        "currentPageNo": _.get(payload, "page.currentPageNo", 1),
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

