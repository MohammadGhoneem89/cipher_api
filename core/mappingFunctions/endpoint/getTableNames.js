'use strict';
const _ = require('lodash');
const endpointDefination = require('../../../lib/repositories/endpointDefination');
var Sequelize = require('sequelize');

exports.getTableNames = async function (payload, UUIDKey, route, callback, JWToken) {
    let endpoint = await endpointDefination.findOne(payload);
    let connectionString = endpoint.address;

    let query = `select tablename from pg_tables where schemaname = 'public'`;

    var sequelize = new Sequelize(connectionString, {})

    return sequelize.query(query).then((data) => {
        let result = _.get(data[1], 'rows', []);

        let tables = result.map(table => {
            return {
                label: table.tablename,
                value: table.tablename
            }
        });

        let response = {
            "getTableNames": {
                "action": "getTableNames",
                "data": {
                    "tables": tables
                }
            }
        };
        return callback(response);
    }).catch((err) => {
        console.log(err);
    });
};