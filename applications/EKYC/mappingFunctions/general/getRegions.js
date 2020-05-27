'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getRegions = function (payload, UUIDKey, route, callback, JWToken) {
    let query = 'select distinct(region) from technician' ;

    pg.connection().then((conn) => {
        return conn.query(query, []).then((data) => {
            let result = _.get(data,'rows',[])
            let regions = []
            result.forEach(element => {
                regions.push({
                    label: element.region,
                    value: element.region
                })
            });
            console.log(regions)

            let response = {
                "getRegions": {
                    "action": "getRegions",
                    "data": {
                        "et-regions": regions
                    }
                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};