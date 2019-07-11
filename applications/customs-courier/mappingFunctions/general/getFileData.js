'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const dates = require('../../../../lib/helpers/dates');
const _ = require('lodash');

exports.getFileData = function (payload, UUIDKey, route, callback, JWToken) {

    let params = []

    let queryFile = 'SELECT * FROM file_details WHERE id=$1::int';
    let queryData = 'SELECT * FROM file_contents WHERE fileid=$1::int';
    let queryCnt = 'SELECT COUNT(*) FROM file_contents WHERE fileid=$1::int ';

    params.push(payload.id)

    if (payload.searchCriteria) {
        if (payload.searchCriteria.status.length == 1) {
            queryData += ' AND status=$2::int '
            queryCnt += ' AND status=$2::int '

            params.push(payload.searchCriteria.status[0])
        }
        else {
            queryData += ' AND status In ($2::int, $3::int) '
            queryCnt += ' AND status In ($2::int, $3::int) '

            params.push(payload.searchCriteria.status[0])
            params.push(payload.searchCriteria.status[1])
        }

    }
    // queryData += ' ORDER BY datetime DESC';


    if (payload.page) {
        queryData += ` limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
    }

    console.log("===", queryFile)
    console.log("+++", queryData)
    console.log("---", queryCnt)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(queryFile, [payload.id]),
            conn.query(queryData, params),
            conn.query(queryCnt, params),
        ]).then((data) => {
            let outVal = [];
            data[1].rows.forEach((elemt) => {
                let element = _.clone(elemt)
                element.action = [{ "actionType": "COMPONENT_FUNCTION", iconName: "fa fa-eye", label: "view" }]
                outVal.push(element);
            })

            let response = {
                "getFileData": {
                    "action": "getFileData",
                    "pageData": {
                        "pageSize": payload.page.pageSize,
                        "currentPageNo": payload.page.currentPageNo,
                        "totalRecords": data[2].rows[0].count
                    },
                    "data": {
                        "searchResult": {
                            fileDetails: data[0].rows,
                            fileData: outVal
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

