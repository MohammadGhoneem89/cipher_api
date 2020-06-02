const logger = require('../../../lib/helpers/logger')().app;
const pointer = require("json-pointer");
const permissionsHelper = require('../../../lib/helpers/permissions');
const permissionConst = require('../../../lib/constants/permissions');
const _ = require('lodash');

var entityDetailOut = function (payload, UUIDKey, route, callback, JWToken) {

  logger.debug(" [ Entity Detail ] PAYLOAD : " + JSON.stringify(payload, null, 2));
  logger.debug(" [ Entity Detail ] UUID : " + UUIDKey);
  logger.debug(" [ Entity Detail ] Route : " + route);
  logger.debug(" [ Entity Detail ] JWToken : " + JSON.stringify(JWToken, null, 2));

  payload.userId = JWToken._id;
  orgDetail(payload, callback, JWToken);

};

var orgDetail = function (payload, entityGetCB, JWToken) {

  logger.debug(" [Entity Detail] Entity ID : " + payload.entityID);
  var response = {
    "entityDetail": {
      "action": "EntityDetail",
      "data": ""
    }
  };
  let out = {}
  if (payload.entityID)
    out.id = payload.entityID || undefined;
  if (payload.spCode)
    out.spCode = payload.spCode || undefined;

  if (payload.spCode == 'SELF')
    out.spCode = JWToken.orgCode;

  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>.", JSON.stringify(out))

  global.db.select("Entity", out, "", function (err, data) {
    if (err) {
      logger.error(" [Entity Detail] Error : " + err);
      return entityGetCB(response);
    }
    data = _.get(data, '[0]', {});
    data.services = data.services || [];
    data.contacts = data.contacts || [];

    data["contacts"].forEach(function (d) {
      pointer.set(d, "/actions", [
        {
          "label": "Edit",
          "iconName": "fa fa-edit",
          "actionType": "COMPONENT_FUNCTION"
        },
        {
          "label": "Delete",
          "iconName": "fa fa-trash",
          "actionType": "COMPONENT_FUNCTION"
        }
      ]);
    });
    data["services"].forEach(function (d) {
      pointer.set(d, "/actions", [
        {
          "label": "Edit",
          "iconName": "fa fa-edit",
          "actionType": "COMPONENT_FUNCTION"
        },
        {
          "label": "Delete",
          "iconName": "fa fa-trash",
          "actionType": "COMPONENT_FUNCTION"
        }
      ]);
    });

    const params = {
      userId: payload.userId,
      documents: data,
      docType: 'actions',
      page: permissionConst.entityDetail.pageId,
      component: ''
    };
    permissionsHelper.embed(params)
      .then((res) => {
        pointer.set(data, '/actions', res.pageActions);
        response["entityDetail"]["data"] = data;
        entityGetCB(response);
      });
  });

};

var entityTypedata = function (payload, UUIDKey, route, callback, JWToken) {

  logger.debug(" [Entity Detail] Entity ID : " + payload.entityID);

  let out = {}

  global.db.select("Entity", out, "", function (err, data) {
    if (err) {
      logger.error(" [Entity Detail] Error : " + err);
      return entityGetCB(response);
    }
    let typeList = [];
    data.forEach((elem) => {
      typeList.push({
        "label": elem.entityName,
        "value": elem.spCode,
        "orgType": elem.orgType,
        "logo": elem.entityLogo.sizeSmall
      });
    });
    var response = {
      "entityTypedata": {
        "action": "entityTypedata",
        "data": typeList
      }
    };
    callback(response);

  });
};

exports.entityDetailOut = entityDetailOut;
exports.entityTypedata = entityTypedata;
