'use strict';
const logger = require('../../../lib/helpers/logger')().app;
const consortium = require('../../../lib/services/consortium');
const _ = require('lodash');
const pointer = require('json-pointer');

function consortiumList(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  list(payload, callback);
}

function list(payload, callback) {
  logger.debug(' [ Consortium List ] Payload : ' + JSON.stringify(payload));
  return consortium.getList(payload)
    .then((res) => {
      let arr = [];
      res.consortium.map(element => {
        arr.push({
          _id: element._id,
          consortiumName: element.consortiumName,
          consortiumType: element.consortiumType,
          actions: [{
            "label": "View",
            "iconName": "fa fa-eye",
            "actionType": "componentAction",
            "URI":["/cipher/consortiumSetup/view/"],
            "params":""
          }]
        });
      })
      const response = {
        consortiumList: {
          action: payload.action,
          pageData: {
            pageSize: payload.page.pageSize,
            currentPageNo: payload.page.currentPageNo,
            totalRecords: res.count
          },
          data: {
            searchResult: arr,
            // actions: res[0].actions,
             typeData : {
                Cipher_blockchainType : res.typeData
             }
          }
        }
      };
      callback(response);
    }).catch(err => {
      logger.error(' [ Consortium List ] Error : ' + err);
      callback(err);

    })

}

exports.consortiumList = consortiumList;

