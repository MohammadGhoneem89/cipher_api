'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getTechnicians = function (payload, UUIDKey, route, callback, JWToken) {
    let query = 'select name from technician where region=$1::varchar and team=$2::varchar' ;

    pg.connection().then((conn) => {
        return conn.query(query, [payload.region, payload.team]).then((data) => {
            let result = _.get(data,'rows',[])
            let technicians = []
            result.forEach(element => {
                technicians.push({
                    label: element.name,
                    value: element.name
                })
            });
            let response = {
                "getTechnicians": {
                    "action": "getTechnicians",
                    "data": {
                        "et-technicians": technicians
                    }
                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};