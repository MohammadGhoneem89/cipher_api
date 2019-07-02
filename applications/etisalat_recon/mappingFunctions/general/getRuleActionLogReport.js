'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getRuleActionLogReport = function (payload, UUIDKey, route, callback, JWToken) {
    let queryData = 'select "ruleId" as rulename, sum(case when correction=\'INITIATED\' THEN 1 ELSE 0 END) as initiated, sum(case when correction=\'CORRECTED\' THEN 1 ELSE 0 END) resolved, sum(case when correction=\'REJECTED\' THEN 1 ELSE 0 END) rejected, sum(case when correction=\'PENDING\' THEN 1 ELSE 0 END) pending from public.ruleauditlog ra left outer join public."NotificationsRule" nr on ra.ruleid=nr.id group by "ruleId" order by "ruleId"' ;

    pg.connection().then((conn) => {
        return conn.query(queryData, []).then((data) => {
            let result = _.get(data,'rows',[])
            let response = {
                "getRuleActionLogReport": {
                    "action": "getRuleActionLogReport",
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