'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getEID_OLT = function (payload, UUIDKey, route, callback, JWToken) {
    let query = `select distinct("tranxData"->'attributeList' -> 'OLT_CODE' -> 'attributesValue' ->> 'GIS') as olt_code
    from datastore_elems
    where "tranxData" -> 'attributeList' -> 'REGION_CODE' -> 'attributesValue' ->> 'GIS' =$1::varchar`;
    let params = [_.get(payload, 'region_code')]
    pg.connection().then((conn) => {
        return conn.query(query, params).then((data) => {
            let result = _.get(data, 'rows', [])
            let olt_codes = []
            result.forEach(element => {
                olt_codes.push({
                    label: element.olt_code,
                    value: element.olt_code
                })
            });
            console.log(olt_codes)

            let response = {
                "getEID_OLT": {
                    "action": "getEID_OLT",
                    "data": {
                        "et-olt_code": olt_codes
                    }
                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};