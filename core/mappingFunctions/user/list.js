'use strict';

const config = require('../../../config');
const user = require('../../../lib/services/user');
const permissionsHelper = require('../../../lib/helpers/permissions');
const permissionConst = require('../../../lib/constants/permissions');
const _ = require('lodash');
function userListOut(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;


  userList(payload, callback, JWToken);
}

async function userList(payload, callback, JWToken) {
  user.getList(payload, JWToken)
    .then(async (usersDetails) => {
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


      const params = {
        userId: JWToken._id,
        documents: {},
        docType: 'actions',
        page: permissionConst.userList.pageId,
        component: permissionConst.userList.component.searchGrid
      };
      return permissionsHelper.embed(params).then((res) => {
        console.log('J', JSON.stringify(res))
        if (res.pageActions.length > 0) {

          response.userList.data.actions = [{
            "value": "4043",
            "type": "pageAction",
            "label": "ADD",
            "labelName": "COM_AB_Add",
            "actionType": "PORTLET_LINK",
            "iconName": "fa fa-plus",
            "URI": "/userSetup"
          }]
        }
        let AvaiableActions = _.get(res, 'documents[0].actions', []);
        for (let rowCount = 0; rowCount < response.userList.data.searchResult.length; rowCount++) {
          let finalAction = []
          if (response.userList.data.searchResult[rowCount].status == "PENDING" || response.userList.data.searchResult[rowCount].status == "REJECTED") {
            AvaiableActions.forEach(element => {
              if (element.value == '401412') {
                finalAction.push(element)
              }
            });
          } else {
            AvaiableActions.forEach(element => {
              if (element.value == '4042') {
                finalAction.push(element)
              }
            });
          }
          response.userList.data.searchResult[rowCount].actions = finalAction

          // [
          //   {
          //     "URI": [
          //       "/userSetup/"
          //     ],
          //     "value": "4042",
          //     "type": "componentAction",
          //     "label": "Edit",
          //     "params": "",
          //     "iconName": "icon-docs"
          //   }
          // ]
        }
        callback(response);
      })
    }
    )
    .catch((err) => {
      callback(err);
    });
}

exports.userListOut = userListOut;

