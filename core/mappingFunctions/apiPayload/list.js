'use strict';

const apiPayload = require('../../../lib/services/apiPayload');
const pg = require('../../api/connectors/postgress');
const {getAPIPayloadListQuery} = require('../../utils/apiPayloadqueries');
const {calculateOffset, getRecordsCount} = require('../../utils/commonUtils');

function list(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  //_list(payload, callback);
  _listPG(payload, callback);
}

function _listPG(payload, callback) {
  let offset = calculateOffset(payload.page.currentPageNo, payload.page.pageSize);

  let [query, countQuery] = getAPIPayloadListQuery(
    payload.page.pageSize,
    offset,
    payload.searchCriteria.channel,
    payload.searchCriteria.action,
    payload.searchCriteria.msgid,
    payload.searchCriteria.fromDate,
    payload.searchCriteria.toDate,
    payload.searchCriteria.payloadField,
    payload.searchCriteria.payloadFieldValue,
    payload.searchCriteria.errCode
  );
  pg.connection().then(async conn => {
    let queryResult = await conn.query(query, []);

    let responseForRecordsLength = await conn.query(countQuery, []);
    console.log('Response for Record Length: ' + responseForRecordsLength);

    let numberOfRecords = getRecordsCount(responseForRecordsLength);
    console.log('getRecordCount' + numberOfRecords);

    console.log('queryResult: ', JSON.stringify(queryResult));
    let {rows} = queryResult;

    let response = {};
    response[payload.action] = {
      action: payload.action,
      pageData: {
        pageSize: payload.page.pageSize,
        currentPageNo: payload.page.currentPageNo,
        totalRecords: numberOfRecords
      },
      data: {
        searchResult: rows
      }
    };
    // response.push(apiPayloadAction);

    appendAction(response);
    callback(response);
  });
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