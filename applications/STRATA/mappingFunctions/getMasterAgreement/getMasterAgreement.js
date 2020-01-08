'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');
const permissionsHelper = require('../../../../lib/helpers/permissions');
const permissionConst = require('../../../../lib/constants/permissions');

function getMasterAgreement(payload, UUIDKey, route, callback, JWToken) {
    let gridActions = [];
    let queryData = `SELECT * FROM masteragreements  WHERE 1=1`;
    let queryCnt = `SELECT COUNT(*) FROM masteragreements  WHERE 1=1`;
    let query = '';

    console.log(JWToken.orgCode, "JWToken");
    if (payload.body.searchCriteria && payload.body.searchCriteria.contractID) {
        let contractID = payload.body.searchCriteria.contractID;
        query += ` AND "tranxData" ->> 'contractID' LIKE lower('%${contractID}%') `;
    }
    //if (JWToken.orgType == 'SUPPLIER') {
    if (payload.body.searchCriteria && payload.body.searchCriteria.customerID) {
        let customerID = payload.body.searchCriteria.customerID;
        query += ` AND "tranxData" ->> 'customerID' = '${customerID}' `;
    }
    if (payload.body.searchCriteria && payload.body.searchCriteria.status) {
        let status = payload.body.searchCriteria.status;
        query += ` AND "tranxData" ->> 'status' =  upper('${status}') `;
    }
    // } 
    if (JWToken.orgType == 'CUSTOMER') {
        query += ` AND "tranxData" ->> 'customerID' = '${JWToken.orgCode}' `;
    }
    let query_ = queryCnt + query
    let queryCriteriaFull = queryData + query;

    if (payload.body.page && payload.body.page.pageSize && payload.body.page.currentPageNo) {
        queryCriteriaFull += ` limit ${payload.body.page.pageSize} 
    OFFSET ${payload.body.page.pageSize * (payload.body.page.currentPageNo - 1)}`;
    }
    console.log("queryCriteriaFull --->", queryCriteriaFull);
    pg.connection().then((conn) => {
        console.log("Connected to DB")
        return Promise.all([
            conn.query(query_, []),
            conn.query(queryCriteriaFull, [])
        ]).then((data) => {
            let result = [];
            if (data) {
                _.get(_.get(data, '[1]', {}), 'rows', []).forEach((elemt) => {
                    elemt.tranxData.uniqueId = elemt.tranxData.contractID + "/" + elemt.tranxData.customerID
                    result.push(elemt.tranxData);
                });
            }


            const params = {
                userId: JWToken._id,
                docType: 'actions',
                documents: result ? result : [],
                page: permissionConst.masterAgreementList.pageId,
                component: permissionConst.masterAgreementList.component.searchGrid
            };

            permissionsHelper.embed(params)
                .then((res) => {
                    gridActions.push({
                        pageActions: res.pageActions,
                        component: res.component
                    });

                    let response = {
                        "getMasterAgreement": {
                            "action": "getMasterAgreement",
                            "pageData": {
                                "pageSize": payload.body.page ? payload.body.page.pageSize : undefined,
                                "currentPageNo": payload.body.page ? payload.body.page.currentPageNo : 1,
                                "totalRecords": data[0].rows[0].count
                            },

                            "searchResult": result,
                            "actions": gridActions
                        }
                    };
                    return callback(response);
                }).catch((err) => {
                    console.log("Error occurred while fetching permissions  ", err);
                    return callback(err);
                });
        });
    }).catch((err) => {
        console.log("Error occurred while executing query ", err);
        return callback(err);
    });
}

exports.getMasterAgreement = getMasterAgreement;