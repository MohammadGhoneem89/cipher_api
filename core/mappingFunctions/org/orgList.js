const logger = require('../../../lib/helpers/logger')().app;
const entityTypeData = require("./orgTypeData");
const pointer = require("json-pointer");
const permissionsHelper = require('../../../lib/helpers/permissions');
const permissionConst = require('../../../lib/constants/permissions');
const _ = require('lodash');
const dateFormat = require('../../../lib/helpers/dates');

let entityListOut = function (payload, UUIDKey, route, callback, JWToken) {
  logger.debug(" [ Entity List ] PAYLOAD : " + JSON.stringify(payload, null, 2));
  logger.debug(" [ Entity List ] UUID : " + UUIDKey);
  logger.debug(" [ Entity List ] Route : " + route);
  logger.debug(" [ Entity List ] JWToken : " + JSON.stringify(JWToken, null, 2));

  orgList(payload, callback, JWToken);
};

function orgList(body, entityList_CB, JWToken) {

  logger.debug(JSON.stringify(JWToken) + "     >>> JWToken");
  logger.debug(" [ Entity List ] Entity list Data : " + JSON.stringify(body));

  let isEntity = false;
  if (JWToken.orgType === 'Entity') {
    if (JWToken.orgType === 'Entity') {
      isEntity = true;
      body.searchCriteria = {spCode: JWToken.orgCode};
    }
  }

  let response = {
    "entityList": {
      "action": "entityList",
      "pageData": body["page"],
      "data": {
        "searchResult": [],
        "typeData": {
          "entityNames": []
        }
      }
    }
  };

  let where = {};

  let searchCriteria = body.searchCriteria;

  let criteria = [];
  if (searchCriteria && searchCriteria.entityName) {
    let entityName = searchCriteria["entityName"];
    criteria.push({"entityName": {'$regex': entityName, '$options': 'i'}});
  }

  if (searchCriteria && searchCriteria.arabicName) {
    let arabicName = searchCriteria.arabicName;
    criteria.push({"arabicName": {'$regex': arabicName, '$options': 'i'}});
  }
  if (searchCriteria && searchCriteria.spCode) {
    let spCode = searchCriteria.spCode;
    criteria.push({"spCode": spCode});
  }
  if (searchCriteria && searchCriteria.isActive) {
    criteria.push({isActive: true});
  }

  where = criteria.length > 0 ? {"$and": criteria} : {};

  let options = {};

  if (body["page"]) {
    options["currentPageNo"] = body["page"]["currentPageNo"];
    options["pageSize"] = body["page"]["pageSize"];
    options["lastID"] = body["page"]["lastID"];
    options.sortData = body.page.sortData;
  }

  global.db.count("Entity", where, function (err, countData) {
    if (err) {
      logger.debug(" [ Entity List ] Count ERROR : " + err);
      entityList_CB(response);
    } else {
      pointer.set(response, "/entityList/pageData/totalRecords", countData);

      global.db.selectWithSort("Entity", where, {
        "entityName": 1,
        "arabicName": 1,
        "entityLogo.sizeSmall": 1,
        "spCode": 1,
        "isActive": 1,
        "services": 1,
        "actions": 1,
        "orgType": 1,
        "status": 1,
        "dateCreated": 1,
        "dateUpdated": 1
      }, options, function (err, entityData) {
        if (err) {
          logger.debug(" [ Entity List ] ERROR : " + err);
          entityList_CB(response);
        } else {
          entityTypeData(function (nameData) {
            let embedField = {};
            for (let j = 0; j < entityData.length; j++) {

              let a = entityData[j].entityName;
              let b = entityData[j].entityLogo ? entityData[j].entityLogo.sizeSmall : "";
              embedField = {};
              pointer.set(embedField, '/name', a);
              pointer.set(embedField, '/imageURL', b);
              pointer.set(entityData, '/' + j + '/entityName', embedField);

              entityData[j].dateCreated = dateFormat.MSddMMyyyyHHmmSS(entityData[j].dateCreated);
              entityData[j].dateUpdated = dateFormat.MSddMMyyyyHHmmSS(entityData[j].dateUpdated);

            }

            const params = {
              userId: JWToken._id,
              documents: entityData,
              docType: 'actions',
              page: permissionConst.entityList.pageId,
              component: permissionConst.entityList.component.searchGrid
            };

            permissionsHelper.embed(params)
              .then((res) => {
                response["entityList"]["data"]["actions"] = res.pageActions;
                response["entityList"]["data"]["searchResult"] = res.documents;
                nameData = _.sortBy(nameData, (d) => d.label.toLowerCase());
                response["entityList"]["data"]["typeData"]["entityNames"] = !isEntity ? nameData : [];
                entityList_CB(response);
              });

          });
        }
      });
    }
  });
};


function orgCodeList() {
  return new Promise((resolve, reject) => {
    global.db.selectWithSort("Entity", {isActive: true}, {
      "spCode": 1,
      "currency": 1,
      "cycle": 1
    }, {}, function (err, entityData) {
      resolve(entityData);
    });
  });
}
;

exports.entityListOut = entityListOut;
exports.orgCodeList = orgCodeList;

