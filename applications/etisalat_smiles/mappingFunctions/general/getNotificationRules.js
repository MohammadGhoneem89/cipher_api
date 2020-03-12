'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getNotificationRules = function (payload, UUIDKey, route, callback, JWToken) {
    let queryData = 'SELECT * FROM "NotificationsRule" WHERE 1=1 ';
    if(payload.body && payload.body.searchCriteria && payload.body.searchCriteria.stream) {
        queryData += `AND stream = '${payload.body.searchCriteria.stream}'`;
    }

    pg.connection().then((conn) => {
        return conn.query(queryData, []).then((data) => {
            let result = [];
            _.get(data,'rows',[]).forEach((elemt) => {
				let notification = {
                    label : elemt.ruleId,
                    value : elemt.ruleId
                }
                result.push(notification);
            });
            let response = {
                "getNotificationRules": {
                    "action": "getNotificationRules",
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