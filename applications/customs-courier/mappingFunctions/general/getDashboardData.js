'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getDashboardData = function (payload, UUIDKey, route, callback, JWToken) {
    // let taskInsertQuery = 'INSERT INTO task (taskid, status, technicianid, documents) values ($1::varchar, $2::varchar, $3::varchar, $4::json)';
    // console.log("----", taskInsertQuery)

    // payload.taskDetails.forEach((detail) => {
    //     let insertTaskDetailsQuery = 'INSERT INTO taskDetails (attributeName, attributeValue, correctedValue, isCorrect, status, taskId) values ($1::varchar, $2::varchar, $3::varchar, $4::bool, $5::varchar, $6::varchar)';
    //     console.log("++++", insertTaskDetailsQuery)
    //     pg.connection().then((conn) => {
    //         conn.query(insertTaskDetailsQuery, [detail.attributeName, detail.attributeValue, detail.correctedValue, detail.isCorrect, detail.status, payload.taskId]).then((data) => {
    //             // success
    //         }).catch((ex) => {
    //             console.log(ex);
    //         })
    //     })
    // })

    // let commentInsertQuery = 'INSERT INTO taskcomments (commentdate, username, commenttext, type ,taskId) values ($1::bigInt, $2::varchar, $3::varchar, $4::varchar, $5::varchar)';
    // let technicianInsertQuery = 'INSERT INTO technician (technicianid, name, team, region) values ($1::varchar, $2::varchar, $3::varchar, $4::varchar) ON CONFLICT DO NOTHING';
    
    // console.log("++++", commentInsertQuery)
    // console.log("###",technicianInsertQuery)

    // pg.connection().then((conn) => {
    //     return Promise.all([
    //         conn.query(taskInsertQuery, [payload.taskId, payload.taskStatus, payload.techId, JSON.stringify(payload.documents)]),
    //         // conn.query(insertTaskDetailsQuery, []),
    //         conn.query(commentInsertQuery, [payload.comments.commentdate, payload.comments.username, payload.comments.commenttext, payload.comments.type, payload.taskId]),
    //         conn.query(technicianInsertQuery, [payload.techId, payload.techName, payload.techTeam, payload.techRegion])
    //     ]).then((data) => {
    //         console.log(data);
    //         let result = _.get(data, 'rowCount', []);
    //         console.log(result)
            let response = { "getDashboardData": { "action": "getDashboardData", "data": { "summary" : {"couriers" : 1, "orders" : 50, "returns" : 1},"orderTracking": { "finalized": 17, "hawbCreated": 26, "exportCleared": 30, "delivered": 19, "returnByCustomer": 35, "undelivered": 30, "importCleared": 27, "partialReturn": 30, "fullReturn": 20 }, "filterCriteria": "HS Codes", "topStats": [{ "label": "HS Code 1", "expAuth": 22 }, { "label": "HS Code 2", "expAuth": 15 }, { "label": "HS Code 3", "expAuth": 13 }, { "label": "HS Code 4", "expAuth": 8 }, { "label": "HS Code 5", "expAuth": 6 } ], "analysisByValue": { "return": 5, "delivered": 1 }, "courierByValue": [{ "name": "Courier 1", "value": 5 }, { "name": "Courier 2", "value": 2 }, { "name": "Courier 3", "value": 1 } ] } } }
            return callback(response);
    //     });
    // }).catch((err) => {
    //     console.log(err);
    // });
};