'use strict';

const apiPayload = require('../../../lib/services/apiPayload');
const { getAPIPayloadDetailQuery } = require('../../utils/apiPayloadqueries');
const pg = require('../../api/connectors/postgress');

function detail(payload, UUIDKey, route, callback, JWToken) {
  payload.userID = JWToken._id;
  //_detail(payload, callback);
  _detailPG(payload, callback);
}

function _detail(payload, callback) {
  apiPayload
    .getDetails(payload)
    .then(detail => {
      let response = {};
      response[payload.action] = {
        action: payload.action,
        data: detail
      };
      callback(response);
    })
    .catch(err => {
      callback(err);
    });
}

function _detailPG(payload, callback) {
  let query = getAPIPayloadDetailQuery(payload.id);
  pg.connection().then(async conn => {
    let queryResult = await conn.query(query, []);
    let { rows } = queryResult;
    let response = {};
    response[payload.action] = {
      action: payload.action,
      data: rows[0]
    };
    callback(response);
  });
}

exports.detail = detail;