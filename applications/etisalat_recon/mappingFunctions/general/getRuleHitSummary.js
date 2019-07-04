'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getRuleHitSummary = function (payload, UUIDKey, route, callback, JWToken) {
    let queryRuleHit = 'select "ruleId", count(*) from public.ruleauditlog ra left outer join public."NotificationsRule" nr on ra.ruleid=nr.id group by "ruleId"' ;
    let queryTotal = 'select count(1) as "count" from datastore_elems where "tranxData"->>\'dataStructureName\'=\'EID\''
    let queryInitPend = 'select  sum(case when rl.correction=\'PENDING\' then 1 else 0 end) as pending, sum(case when rl.correction=\'INITIATED\' then 1 else 0 end) as initiated from ruleauditlog rl where correction in (\'PENDING\',\'INITIATED\')'

    let params = []
    if (payload.searchCriteria) {
        queryRuleHit = 'select "ruleId", count(*) from public.ruleauditlog ra left outer join public."NotificationsRule" nr on ra.ruleid=nr.id where datetime between $1::timestamp and $2::timestamp group by "ruleId"'
        queryTotal += ' and "createdAt" between $1::timestamp and $2::timestamp'
        queryInitPend += ' and datetime between $1::timestamp and $2::timestamp'
        
        params.push(payload.searchCriteria.fromData)
        params.push(payload.searchCriteria.toData)
    }

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(queryRuleHit, params),
            conn.query(queryTotal, params),
            conn.query(queryInitPend, params),
        ]).then((data) => {
            //let result = _.get(data,'rows',[])
            let response = {
                "getRuleHitSummary": {
                    "action": "getRuleHitSummary",
                    "data": {
                        "searchResult": {
                            ruleHit: (_.get(_.get(data,'[0]',{}),'rows',[])),
                            total: (_.get(_.get(_.get(_.get(data,'[1]',{}),'rows',[]),'[0]',{}), 'count', "")),
                            pending: (_.get(data, '[2].rows[0].pending')) == null ? "0" : (_.get(data, '[2].rows[0].pending')),
                            initiated: (_.get(data, '[2].rows[0].initiated')) == null ? "0" : (_.get(data, '[2].rows[0].initiated'))
                        }
                    }
                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};