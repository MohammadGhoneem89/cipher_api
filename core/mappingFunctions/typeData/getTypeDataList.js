'use strict';

const typeData = require('../../../lib/services/typeData');
let pointer = require("json-pointer");
const config = require('../../../config');


function typeDataList(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  get(payload, callback);
}

function typeDataListByType(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  let isOwner = false;
  let ownOrg = config.get('ownerOrgs', [])
  if (ownOrg.indexOf(JWToken.orgCode) > -1) {
    isOwner = true;
  }
  getDataByType(payload, callback,isOwner);
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

async function getDataByType(payload, callback,isOwner) {
  try {
    const rows = await typeData.getTypeDataDetailByType(payload);
    if (rows[0] && rows[0].length) {
      for (let elms of rows[0]) {
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
          searchResult: rows[0],
          isOwner,
          pageData: {
            pageSize: payload.page.pageSize,
            currentPageNo: payload.page.currentPageNo,
            totalRecords: rows[1]
          }
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