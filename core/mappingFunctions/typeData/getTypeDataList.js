'use strict';

const typeData = require('../../../lib/services/typeData');
let pointer = require("json-pointer");


function typeDataList(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  get(payload, callback);
}

function typeDataListByType(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  getDataByType(payload, callback);
}

function get(payload, callback) {
  typeData.getDetails(payload)
    .then((typeData) => {
      const response = {
        typeDataList: {
          action: payload.action,
          pageData: {
            pageSize: payload.page.pageSize,
            currentPageNo: payload.page.currentPageNo,
            totalRecords: typeData.count
          },
          data: {
            searchResult: typeData.data,
            typeData: {
              typeDataListNames: typeData.typeDataList

            },
            actions: typeData.actions
          }
        }
      };
      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

async function getDataByType(payload, callback) {
  try {
    const rows = await typeData.getTypeDataDetailByType(payload);
    if (rows && rows.length) {
      for (let elms of rows) {
        elms.actions = [{
          "value": "1003",
          "type": "componentAction",
          "label": "View",
          "params": "",
          "iconName": "icon-docs",
          "URI": [`/pickupListSetup/edit/`]
        }];
      }
    }
    const response = {
      [payload.action]: {
        action: payload.action,
        data: {
          searchResult: rows
        }
      }
    };
    callback(response);
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}


module.exports = {
  typeDataList,
  typeDataListByType
};