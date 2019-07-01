'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.updateTask = function (payload, UUIDKey, route, callback, JWToken) {
    let taskUpdateQuery = 'UPDATE task SET status=\'' + payload.taskStatus + '\' WHERE taskid=\'' + payload.taskId + '\''
    //let taskInsertQuery = 'INSERT INTO task (taskid, status, documents) values (\'' + payload.taskId + '\', \'' + payload.taskStatus  + '\', \'' + JSON.stringify(payload.documents)  + '\')';
    console.log("----", taskUpdateQuery)

    payload.taskDetails.forEach((detail) => {
        let updateTaskDetailsQuery = 'UPDATE taskDetails set status=\'' + detail.status + '\' where id=\'' + detail.id + '\'';
        console.log("====", updateTaskDetailsQuery)
        // foreach 
        pg.connection().then((conn) => {
            conn.query(updateTaskDetailsQuery, []).then((data) => {
                // success
            }).catch((ex) => {
                console.log(ex);
            })
        })


        //insertTaskDetailsQuery += '(\'' + detail.attributeName + '\', \'' + detail.attributeValue + '\', \'' + detail.correctedValue + '\', \'' + detail.isCorrect + '\', \'' + detail.status + '\', \'' + payload.taskId + '\'), '
    })
    //insertTaskDetailsQuery = insertTaskDetailsQuery.substring(0, insertTaskDetailsQuery.length - 2)

    let commentInsertQuery = ''
    if (payload.comments.length != 0) {
        commentInsertQuery = 'INSERT INTO taskcomments (commentdate, username, commenttext, type ,taskId, ecd, reason, attributeid, attributename, status) values '// + payload.comments.commentdate + '\', \'' + payload.comments.username  + '\', \'' + payload.comments.commenttext + '\', \'' + payload.comments.type + '\', \'' + payload.taskId  + '\', \'' + payload.comments.ecd  + '\', \'' + payload.comments.reason  + '\', \'' + payload.comments.attributeid  + '\')';
        payload.comments.forEach((comment, index) => {
            if (comment.ecd == undefined) {
                comment.ecd = 0
            }
            commentInsertQuery += '(\'' + comment.commentdate + '\', \'' + comment.username + '\', \'' + comment.commenttext + '\', \'' + comment.type + '\', \'' + payload.taskId + '\', ' + comment.ecd + ', \'' + payload.reason + '\', \'' + comment.attributeid + '\', \'' + comment.attributename + '\', \'' + comment.status + '\'), '
        })
        commentInsertQuery = commentInsertQuery.substring(0, commentInsertQuery.length - 2)
    }

    //(\'' + payload.taskId + '\', \'' + payload.taskStatus  + '\', \'' + JSON.stringify(payload.documents)  + '\')';
    console.log("++++", commentInsertQuery)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(taskUpdateQuery, []),
            conn.query(commentInsertQuery, [])
        ]).then((data) => {

            console.log(data);
            let result = _.get(data, 'rowCount', []);
            console.log(result)
            let response = { "responseMessage": { "action": "updateTask", "data": { "message": { "status": "OK", "errorDescription": "Task Updated Success!!", "displayToUser": true, "newPageURL": "/etisalat/taskscreenlist" } } } }
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};