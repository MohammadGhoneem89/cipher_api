'use strict';

const config = require('../../../config');
const user = require('../../../lib/services/user');

function userListOut(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  if (!(JWToken.orgType==='MASTER') && JWToken.userID != 'admin' && JWToken.userID != 'Admin') {
    payload.searchCriteria.orgCode = JWToken.orgCode;
  }
    
  userList(payload, callback);
}

function userList(payload, callback) {
  user.getList(payload)
    .then((usersDetails) => {
      let response = {
        userList: {
          action: payload.action,
          pageData: {
            pageSize: payload.page.pageSize,
            currentPageNo: payload.page.currentPageNo,
            totalRecords: usersDetails.count
          },
          data: {
            searchResult: usersDetails.users,
            actions: usersDetails.actions
          }
        }
      };

      response.userList.data.actions = [{
        "value" : "4043",
        "type" : "pageAction",
        "label" : "ADD",
        "labelName" : "COM_AB_Add",
        "actionType" : "PORTLET_LINK",
        "iconName" : "fa fa-plus",
        "URI" : "/userSetup"
    }]
      for (let rowCount=0; rowCount < response.userList.data.searchResult.length; rowCount++) {
        response.userList.data.searchResult[rowCount].actions = [
          {
            "URI": [
              "/userSetup/"
            ],
            "value": "4042",
            "type": "componentAction",
            "label": "Edit",
            "params": "",
            "iconName": "icon-docs"
          }

        ]

      }


      callback(response);
    })
    .catch((err) => {
      callback(err);
    });
}

exports.userListOut = userListOut;

