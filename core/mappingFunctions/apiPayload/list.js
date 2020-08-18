'use strict';

const apiPayload = require('../../../lib/services/apiPayload');
const pg = require('../../api/connectors/postgress');
const { getAPIPayloadListQuery } = require('../../utils/apiPayloadqueries');
const { calculateOffset, getRecordsCount } = require('../../utils/commonUtils');
const sqlserver = require('../../api/connectors/mssql');
const config = require('../../../config');
const _ = require('lodash');
function list(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  //_list(payload, callback);
  _listPG(payload, callback, JWToken);
}

function _listPG(payload, callback, JWToken) {
  let offset = calculateOffset(payload.page.currentPageNo, payload.page.pageSize);

  let [query, countQuery] = getAPIPayloadListQuery(
    payload.page.pageSize,
    offset,
    payload.searchCriteria.channel,
    payload.searchCriteria.action,
    payload.searchCriteria.uuid,
    payload.searchCriteria.fromDate,
    payload.searchCriteria.toDate,
    payload.searchCriteria.payloadField,
    payload.searchCriteria.payloadFieldValue,
    payload.searchCriteria.errCode,
    JWToken
  );

  if (config.get('database', 'postgress') == 'mssql') {
    sqlserver.connection('apipayload').then(async (conn) => {
      let responseForRecordsLength = await conn.request().query(countQuery);
      console.log('Response for Record Length: ' + JSON.stringify(responseForRecordsLength));
      let numberOfRecords = _.get(responseForRecordsLength, 'recordset.[0].numberOfRecords', 0);
      console.log('getRecordCount' + numberOfRecords);
      let queryResult = await await conn.request().query(query);
      console.log('queryResult: ', JSON.stringify(queryResult));
      let { recordset } = queryResult;
      let response = {};
      response[payload.action] = {
        action: payload.action,
        pageData: {
          pageSize: payload.page.pageSize,
          currentPageNo: payload.page.currentPageNo,
          totalRecords: numberOfRecords
        },
        data: {
          searchResult: recordset
        }
      };
      appendAction(response);
      conn.close();
      callback(response);
    }).catch((ex) => {
      console.log(ex)
    })
  } else {
    pg.connection().then(async conn => {

      let queryResult = await conn.query(query, []);
      let responseForRecordsLength = await conn.query(countQuery, []);
      console.log('Response for Record Length: ' + responseForRecordsLength);

      let numberOfRecords = getRecordsCount(responseForRecordsLength);
      console.log('getRecordCount' + numberOfRecords);

      console.log('queryResult: ', JSON.stringify(queryResult));
      let { rows } = queryResult;

      let response = {};
      response[payload.action] = {
        action: payload.action,
        pageData: {
          pageSize: payload.page.pageSize,
          currentPageNo: payload.page.currentPageNo,
          totalRecords: numberOfRecords
        },
        data: {
          searchResult: rows || recordset
        }
      };
      // response.push(apiPayloadAction);

      appendAction(response);
      callback(response);
    });
  }


}

function _list(payload, callback) {
  apiPayload
    .getList(payload)
    .then(res => {
      const response = {};
      response[payload.action] = {
        action: payload.action,
        pageData: {
          pageSize: payload.page.pageSize,
          currentPageNo: payload.page.currentPageNo,
          totalRecords: res.count
        },
        data: {
          searchResult: res.list
        }
      };
      callback(response);
    })
    .catch(err => {
      callback(err);
    });
}

function appendAction(response) {
  let apipayloadLength = response.APIPayLoadList.data.searchResult.length;
  var apipayloadIterator;
  for (apipayloadIterator = 0; apipayloadIterator < apipayloadLength; apipayloadIterator++) {
    //response[apipayloadIterator] = {response};
    if (response.APIPayLoadList.data.searchResult) {
      let apiPayloadAction = {
        actions: [
          {
            URI: ['#modelWindows'],
            value: '4057',
            type: 'componentAction',
            actionType: 'modal',
            label: 'View',
            params: '',
            iconName: 'icon-docs',
            _id: response.APIPayLoadList.data.searchResult[apipayloadIterator].uuid
          }
        ]
      };
      console.log(response.APIPayLoadList.data.searchResult[apipayloadIterator].uuid);
      response.APIPayLoadList.data.searchResult[apipayloadIterator].actions = apiPayloadAction.actions;
    }
  }
}

exports.list = list;