'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.updateTask = function (payload, UUIDKey, route, callback, JWToken) {
    let taskUpdateQuery = 'UPDATE task_ndg SET status=$1::varchar, ecd=$2::bigInt WHERE taskid=$3::varchar'
    
    console.log("----", taskUpdateQuery)

    payload.taskDetails.forEach((detail) => {
        let updateTaskDetailsQuery = `UPDATE taskDetails set status=$1::varchar where id=$2::int`;
        console.log("====", updateTaskDetailsQuery)
        pg.connection().then((conn) => {
            conn.query(updateTaskDetailsQuery, [detail.status, detail.id]).then((data) => {
                // success
            }).catch((ex) => {
                console.log(ex);
            })
        })
    })

    payload.comments.forEach((comment) => {
        console.log("----------", JSON.stringify(comment))
        let commentInsertQuery = 'INSERT INTO taskcomments (commentdate, username, commenttext, type, taskId, ecd, reason, attributeid, attributename, status, attributeshortname) values ($1::bigInt, $2::varchar, $3::varchar, $4::varchar, $5::varchar, $6::bigInt, $7::varchar, $8::int, $9::varchar, $10::varchar, $11::varchar)';
        console.log("++++", commentInsertQuery)
        pg.connection().then((conn) => {
            conn.query(commentInsertQuery, [comment.commentdate, comment.username, comment.commenttext, comment.type, payload.taskId, comment.ecd, comment.reason, comment.attributeid, comment.attributename, comment.status, comment.attributeShortName]).then((data) => {
                // success
            }).catch((ex) => {
                console.log(ex);
            })
        })
    })


    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(taskUpdateQuery, [payload.taskStatus, payload.minECD, payload.taskId])
        ]).then((data) => {

            console.log("data-->", data);
            let result = _.get(data, 'rowCount', []);
            console.log(result)
            let response = { "responseMessage": { "action": "updateTask", "data": { "message": { "status": "OK", "errorDescription": "Task Updated Success!!", "displayToUser": true, "newPageURL": "/etisalat/taskscreenlist" } } } }
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};