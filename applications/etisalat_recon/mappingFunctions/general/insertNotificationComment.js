'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.insertNotificationComment = function (payload, UUIDKey, route, callback, JWToken) {
  const date = Math.round((new Date().getTime()));
  let notificationInsertQuery = 'INSERT INTO notificationcomments (commenttext, ruleauditlogid, commentdate, username, commentfrom) values ($1::varchar, $2::varchar, $3::bigInt, $4::varchar, $5::varchar)';
  let correctioStatusUpdateQuery = 'UPDATE ruleauditlog set correction = $1::varchar WHERE id=$2::varchar';

  pg.connection().then((conn) => {
    return Promise.all([
      conn.query(notificationInsertQuery, [payload.comment, payload.ruleauditlogid, date, JWToken.userID, payload.status]),
      conn.query(correctioStatusUpdateQuery, [payload.status, payload.ruleauditlogid, ])
    ]).then((data) => {
      let result = _.get(data, 'rowCount', []);
      let response = { "responseMessage": { "action": "insertNotificationComment", "data": { "message": { "status": "OK", "errorDescription": "Status Updated Success!!", "displayToUser": true, "newPageURL": "/etisalat/rulesactionlog" } } } }
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
};