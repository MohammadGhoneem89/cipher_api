'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.insertTask = function (payload, UUIDKey, route, callback, JWToken) {
    let taskInsertQuery = 'INSERT INTO task_ndg (taskid, status, technicianid, documents) values ($1::varchar, $2::varchar, $3::varchar, $4::json)';
    console.log("----", taskInsertQuery)

    payload.taskDetails.forEach((detail) => {
        let insertTaskDetailsQuery = 'INSERT INTO taskDetails (attributeName, attributeValue, correctedValue, isCorrect, status, taskId) values ($1::varchar, $2::varchar, $3::varchar, $4::bool, $5::varchar, $6::varchar)';
        console.log("++++", insertTaskDetailsQuery)
        pg.connection().then((conn) => {
            conn.query(insertTaskDetailsQuery, [detail.attributeName, detail.attributeValue, detail.correctedValue, detail.isCorrect, detail.status, payload.taskId]).then((data) => {
                // success
            }).catch((ex) => {
                console.log(ex);
            })
        })
    })

    let commentInsertQuery = 'INSERT INTO taskcomments (commentdate, username, commenttext, type ,taskId) values ($1::bigInt, $2::varchar, $3::varchar, $4::varchar, $5::varchar)';
    let technicianInsertQuery = 'INSERT INTO technician (technicianid, name, team, region) values ($1::varchar, $2::varchar, $3::varchar, $4::varchar) ON CONFLICT DO NOTHING';
    
    console.log("++++", commentInsertQuery)
    console.log("###",technicianInsertQuery)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(taskInsertQuery, [payload.taskId, payload.taskStatus, payload.techId, JSON.stringify(payload.documents)]),
            // conn.query(insertTaskDetailsQuery, []),
            conn.query(commentInsertQuery, [payload.comments.commentdate, payload.comments.username, payload.comments.commenttext, payload.comments.type, payload.taskId]),
            conn.query(technicianInsertQuery, [payload.techId, payload.techName, payload.techTeam, payload.techRegion])
        ]).then((data) => {
            console.log(data);
            let result = _.get(data, 'rowCount', []);
            console.log(result)
            let response = { "responseMessage": { "action": "inserttask", "data": { "message": { "status": "OK", "errorDescription": "Task Inserted Success!!", "displayToUser": true, "newPageURL": "/etisalat/makerscreenlink" } } } }
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
        return callback(err)
    });
};