'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.insertTask = function (payload, UUIDKey, route, callback, JWToken) {
    let taskInsertQuery = 'INSERT INTO task (taskid, status, documents) values (\'' + payload.taskId + '\', \'' + payload.taskStatus  + '\', \'' + JSON.stringify(payload.documents)  + '\')';
    console.log("----", taskInsertQuery)
    let insertTaskDetailsQuery = 'INSERT INTO taskDetails (attributeName, attributeValue, status, taskId) values ';
    payload.taskDetails.forEach((detail,index) => {
        insertTaskDetailsQuery += '(\'' + detail.attributeName + '\', \'' + detail.attributeValue + '\', \'' + detail.status + '\', \'' + payload.taskId + '\'), '
    })
    insertTaskDetailsQuery = insertTaskDetailsQuery.substring(0, insertTaskDetailsQuery.length - 2)
    console.log("====",insertTaskDetailsQuery)
    let commentInsertQuery = 'INSERT INTO taskcomments (commentdate, username, commenttext, taskId) values ';
    payload.comments.forEach((comment,index) => {
        commentInsertQuery += '(\'' + comment.commentdate + '\', \'' + comment.username + '\', \'' + comment.commenttext + '\', \'' + payload.taskId + '\'), '
    })
    commentInsertQuery = commentInsertQuery.substring(0, commentInsertQuery.length - 2)
    //(\'' + payload.taskId + '\', \'' + payload.taskStatus  + '\', \'' + JSON.stringify(payload.documents)  + '\')';
    console.log("++++", commentInsertQuery)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(taskInsertQuery, []),
            conn.query(insertTaskDetailsQuery, []),
            conn.query(commentInsertQuery, [])
        ]).then((data) => {
            console.log(data);
            let result = _.get(data, 'rowCount', []);
            console.log(result)
            let response = { "responseMessage": { "action": "inserttask", "data": { "message": { "status": "OK", "errorDescription": "Task Inserted Success!!", "displayToUser": true, "newPageURL": "/hyperledger/workboard" } } } }
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};