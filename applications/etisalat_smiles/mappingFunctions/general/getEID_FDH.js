'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getEID_FDH = function (payload, UUIDKey, route, callback, JWToken) {
    let query = `select distinct("tranxData"->'attributeList' -> 'FDH_NUMBER' -> 'attributesValue' ->> 'GIS') as fdh_number
    from datastore_elems
    where "tranxData" -> 'attributeList' -> 'OLT_CODE' -> 'attributesValue' ->> 'GIS' =$1::varchar`;
    let params = [_.get(payload, 'olt_code')]
    pg.connection().then((conn) => {
        return conn.query(query, params).then((data) => {
            let result = _.get(data, 'rows', [])
            let fdh_numbers = []
            result.forEach(element => {
                fdh_numbers.push({
                    label: element.fdh_number,
                    value: element.fdh_number
                })
            });
            console.log(fdh_numbers)

            let response = {
                "getEID_FDH": {
                    "action": "getEID_FDH",
                    "data": {
                        "et-fdh_number": fdh_numbers
                    }
                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};