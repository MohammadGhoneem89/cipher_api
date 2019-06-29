'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.getTask = function (payload, UUIDKey, route, callback, JWToken) {
    let taskgetQuery = 'SELECT * FROM task where taskid = \'' + payload.taskId  + '\'';
    console.log("----", taskgetQuery)
    let getTaskDetailsQuery = 'SELECT * FROM taskdetails where taskid = \'' + payload.taskId  + '\'';
    console.log("====",getTaskDetailsQuery)
    let commentGetQuery = 'SELECT * FROM taskcomments where taskid = \'' + payload.taskId  + '\' ORDER BY commentdate DESC';
    console.log("++++", commentGetQuery)

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(taskgetQuery, []),
            conn.query(getTaskDetailsQuery, []),
            conn.query(commentGetQuery, [])
        ]).then((data) => {
            console.log(data);
            const task = (_.get(_.get(data,'[0]',{}),'rows',[]))
            const taskDetails = (_.get(_.get(data,'[1]',{}),'rows',[]))
            const taskComments = (_.get(_.get(data,'[2]',{}),'rows',[]))
            
            const response = {
                "getTask": {
                    "action": "getTask",
                    "data": { 
                        "task" : task,
                        "taskDetails": taskDetails,
                        "taskComments" : taskComments
                    }
                }
            }
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};