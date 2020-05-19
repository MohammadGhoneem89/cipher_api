'use strict';
const _ = require('lodash');
const Sequelize = require('sequelize');
const endpointDefination = require('../../../lib/repositories/endpointDefination');

exports.getFieldsList = async function (payload, UUIDKey, route, callback, JWToken) {
    let endpoint = await endpointDefination.findOne(payload);
    let connectionString = endpoint.address;

    let params = []
    let query = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${payload.table}' ORDER BY ORDINAL_POSITION`;
    params.push(payload.table)

    var sequelize = new Sequelize(connectionString, {})

    return sequelize.query(query).then((data) => {
        let result = _.get(data[1], 'rows', []);

        let fields = result.map(field => {
            return field.column_name
        });

        let response = {
            "getFieldsList": {
                "action": "getFieldsList",
                "data": {
                    "fields": fields
                }
            }
        };
        return callback(response);
    }).catch((err) => {
        console.log(err);
    });
};