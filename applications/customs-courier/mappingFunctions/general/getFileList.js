'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const dates = require('../../../../lib/helpers/dates');
const _ = require('lodash');

exports.getFileList = function (payload, UUIDKey, route, callback, JWToken) {

    let params = []
    let queryData = 'SELECT * FROM file_details ';
    let queryCnt = 'SELECT COUNT(*) FROM file_details ';

    if (payload.searchCriteria) {
        queryData += 'WHERE name=$1::varchar '
        queryCnt += 'WHERE name=$1::varchar '
        params.push(payload.searchCriteria.filename)
    }
    queryData += ' ORDER BY datetime DESC';


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
                let element = _.clone(elemt)
                element.action = [{ "value": "1003", "type": "componentAction", "label": "View", "params": "", "iconName": "icon-docs", "URI": ["/courier/fileData/"] }]
                outVal.push(element);
            })

                let response = {
                    "getFileList": {
                        "action": "getFileList",
                        "pageData": {
                            "pageSize": payload.page.pageSize,
                            "currentPageNo": payload.page.currentPageNo,
                            "totalRecords": data[1].rows[0].count
                        },
                        "data": {
                            "searchResult": {
                                fileList: outVal
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

