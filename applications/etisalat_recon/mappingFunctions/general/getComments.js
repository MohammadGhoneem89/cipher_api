'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getComments = function (payload, UUIDKey, route, callback, JWToken) {
    let queryData = 'SELECT * FROM "notificationcomments" WHERE ruleauditlogid=\'' + payload.ruleauditlogid + '\'' ;

    pg.connection().then((conn) => {
        return conn.query(queryData, []).then((data) => {
            let result = _.get(data,'rows',[])
            let response = {
                "getComments": {
                    "action": "getComments",
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
};