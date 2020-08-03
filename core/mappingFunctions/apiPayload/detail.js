'use strict';

const apiPayload = require('../../../lib/services/apiPayload');
const { getAPIPayloadDetailQuery } = require('../../utils/apiPayloadqueries');
const pg = require('../../api/connectors/postgress');
const _ = require('lodash');
const config = require('../../../config');
const sqlserver = require('../../api/connectors/mssql');
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



  if (config.get('database', 'postgress') == "mssql") {
    sqlserver.connection('apipayload').then(async (conn) => {
      let query = getAPIPayloadDetailQuery(payload.id);
      let queryResult = await conn.query(query, []);
      let { recordset } = queryResult;
      let tracking = await conn.query(`select * from apipayloadevents where uuid='${recordset[0].uuid}'`, []);
      let response = {};
      let outval = recordset[0];
      _.set(outval, 'tracking', tracking.recordset)
      response[payload.action] = {
        action: payload.action,
        data: outval
      };
      conn.close();
      callback(response);
    });
  } else {
    let query = getAPIPayloadDetailQuery(payload.id);
    pg.connection().then(async conn => {
      let queryResult = await conn.query(query, []);
      let { rows } = queryResult;
      pg.connection().then(async conn2 => {
        let tracking = await conn2.query(`select * from apipayloadevents where uuid='${rows[0].uuid}'`, []);
        let response = {};
        let outval = rows[0];
        _.set(outval, 'tracking', tracking.rows)
        response[payload.action] = {
          action: payload.action,
          data: outval
        };
        callback(response);
      });
    });
  }

}

exports.detail = detail;