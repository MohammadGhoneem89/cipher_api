'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.insertTask = function (payload, UUIDKey, route, callback, JWToken) {
    let taskInsertQuery = 'INSERT INTO task (taskid, status, technicianid, documents) values (\'' + payload.taskId + '\', \'' + payload.taskStatus  + '\', \'' + payload.techId  + '\', \'' + JSON.stringify(payload.documents)  + '\')';
    console.log("----", taskInsertQuery)
    let insertTaskDetailsQuery = 'INSERT INTO taskDetails (attributeName, attributeValue, correctedValue, isCorrect, status, taskId) values ';
    payload.taskDetails.forEach((detail,index) => {
        insertTaskDetailsQuery += '(\'' + detail.attributeName + '\', \'' + detail.attributeValue + '\', \'' + detail.correctedValue + '\', \'' + detail.isCorrect + '\', \'' + detail.status + '\', \'' + payload.taskId + '\'), '
    })
    insertTaskDetailsQuery = insertTaskDetailsQuery.substring(0, insertTaskDetailsQuery.length - 2)
    console.log("====",insertTaskDetailsQuery)
    let commentInsertQuery = 'INSERT INTO taskcomments (commentdate, username, commenttext, type ,taskId) values (\'' + payload.comments.commentdate + '\', \'' + payload.comments.username  + '\', \'' + payload.comments.commenttext + '\', \'' + payload.comments.type + '\', \'' + payload.taskId  + '\')';
    let technicianInsertQuery = 'INSERT INTO technician (technicianid, name) values (\'' + payload.techId + '\', \'' + payload.techName  + '\') ON CONFLICT DO NOTHING';
    // payload.comments.forEach((comment,index) => {
    //     commentInsertQuery += '(\'' + comment.commentdate + '\', \'' + comment.username + '\', \'' + comment.commenttext + '\', \'' + payload.taskId + '\'), '
    // })
    // commentInsertQuery = commentInsertQuery.substring(0, commentInsertQuery.length - 2)
    //(\'' + payload.taskId + '\', \'' + payload.taskStatus  + '\', \'' + JSON.stringify(payload.documents)  + '\')';
    console.log("++++", commentInsertQuery)
    console.log("###",technicianInsertQuery)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(taskInsertQuery, []),
            conn.query(insertTaskDetailsQuery, []),
            conn.query(commentInsertQuery, []),
            conn.query(technicianInsertQuery, [])
        ]).then((data) => {
            console.log(data);
            let result = _.get(data, 'rowCount', []);
            console.log(result)
            let response = { "responseMessage": { "action": "inserttask", "data": { "message": { "status": "OK", "errorDescription": "Task Inserted Success!!", "displayToUser": true, "newPageURL": "/etisalat/makerscreenlink" } } } }
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};