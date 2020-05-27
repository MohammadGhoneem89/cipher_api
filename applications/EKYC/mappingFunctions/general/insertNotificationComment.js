'use strict';
let config = require('../../../api/connectors/smiles.json');
const rp = require('request-promise');
const logger = require('../../../../lib/helpers/logger')().app;
const pg = require('../../../../core/api/connectors/postgress');
const _ = require('lodash');

exports.insertNotificationComment = function (payload, UUIDKey, route, callback, JWToken) {
  const date = Math.round((new Date().getTime()));
  let notificationInsertQuery = 'INSERT INTO notificationcomments (commenttext, ruleauditlogid, commentdate, username, commentfrom, ecd, reason, ds_key, type) values ($1::varchar, $2::varchar, $3::bigInt, $4::varchar, $5::varchar, $6::bigInt, $7::varchar, $8::varchar, $9::varchar)';
  let correctionStatusUpdateQuery = ''
  let params = []
  if(payload.type == 'notification') {
    correctionStatusUpdateQuery = 'UPDATE ruleauditlog set correction = $1::varchar WHERE id=$2::integer';
    params = [payload.status, payload.ruleauditlogid]
  }
  
  pg.connection().then((conn) => {
    return Promise.all([
      conn.query(notificationInsertQuery, [payload.comment, payload.ruleauditlogid, date, JWToken.userID, payload.status, payload.ecd != null ? payload.ecd : null, payload.reason != null ? payload.reason : null, payload.ds_key, payload.type]),
      conn.query(correctionStatusUpdateQuery, params)
    ]).then((data) => {
      let result = _.get(data, 'rowCount', []);
      let response = { "responseMessage": { "action": "insertNotificationComment", "data": { "message": { "status": "OK", "errorDescription": "Status Updated Success!!", "displayToUser": true } } } }
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
    let response = { "responseMessage": { "action": "insertNotificationComment", "data": { "message": { "status": "Error", "errorDescription": err, "displayToUser": true } } } }
    return callback(response);
  });
};