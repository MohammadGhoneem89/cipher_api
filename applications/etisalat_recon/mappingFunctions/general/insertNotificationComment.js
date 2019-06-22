'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.insertNotificationComment = function (payload, UUIDKey, route, callback, JWToken) {
    const date = Math.round((new Date().getTime()));
    let notificationInsertQuery = 'INSERT INTO notificationcomments (commenttext, ruleauditlogid, commentdate, username, commentfrom) values (\'' + payload.comment + '\', \'' + payload.ruleauditlogid + '\', \'' + date + '\', \'' + payload.username + '\', \'' + payload.from + '\')';
    console.log("-=-=-", notificationInsertQuery)
    let correctioStatusUpdateQuery = 'UPDATE ruleauditlog set correction = \'Pending\' WHERE datastructureid=\'' + payload.ruleauditlogid + '\'';

    pg.connection().then((conn) => {
        return Promise.all([
            conn.query(notificationInsertQuery, []),
            conn.query(correctioStatusUpdateQuery, [])
        ]).then((data) => {
            console.log(data);
            let result = _.get(data, 'rowCount', []);
            console.log(result)
            let response = { "responseMessage": { "action": "insertNotificationComment", "data": { "message": { "status": "OK", "errorDescription": "Status Updated Success!!", "displayToUser": true, "newPageURL": "/etisalat/rulesactionlog" } } } }
            return callback(response);
        });
    }).catch((err) => {
        console.log(err);
    });
};