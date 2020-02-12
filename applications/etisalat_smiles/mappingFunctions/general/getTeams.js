'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getTeams = function (payload, UUIDKey, route, callback, JWToken) {
    let query = 'select distinct(team) from technician where region=$1::varchar' ;

    pg.connection().then((conn) => {
        return conn.query(query, [payload.region]).then((data) => {
            let result = _.get(data,'rows',[])
            let teams = []
            result.forEach(element => {
                teams.push({
                    label: element.team,
                    value: element.team
                })
            });
            let response = {
                "getTeams": {
                    "action": "getTeams",
                    "data": {
                        "et-teams": teams
                    }
                }
            };
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};