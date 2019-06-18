'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getRuleAuditLog = function (payload, UUIDKey, route, callback, JWToken) {
    let queryData = 'SELECT * FROM "ruleauditlog" WHERE 1=1 ';
    let queryCnt = 'SELECT count(*) FROM "ruleauditlog" WHERE 1=1 ';

    console.log("payload----->", payload)

    if (payload.page) {
        queryData += ` limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
    }

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(queryCnt, []),
            conn.query(queryData, [])
        ]).then((data) => {
            console.log("=====",_.get(_.get(data,'[1]',{}),'rows',[]))
            console.log("!!!")
            console.log("-----",data[0].rows[0].count)
            console.log("@@@")
            let result =  _.get(_.get(data,'[1]',{}),'rows',[])
            let response = {
                "getRuleAuditLog": {
                    "action": "getRuleAuditLog",
                    "pageData": {
                        "pageSize": payload.page.pageSize,
                        "currentPageNo": payload.page.currentPageNo,
                        "totalRecords": data[0].rows[0].count
                    },
                    "data": {
                        "searchResult": result
                    }
                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
}