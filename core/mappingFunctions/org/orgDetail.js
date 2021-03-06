const logger = require('../../../lib/helpers/logger')().app;
const pointer = require("json-pointer");
const permissionsHelper = require('../../../lib/helpers/permissions');
const permissionConst = require('../../../lib/constants/permissions');
const _ = require('lodash');
const pg = require('../../api/connectors/postgress');
const sqlserver = require('../../api/connectors/mssql');
const config = require('../../../config');
const moment = require('moment');

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
    let start = moment().startOf('month'),
      end = moment().startOf('day')
    let cycle = data.cycle || "Monthly";
    console.log("cycle>>>>>>>>", cycle)
    if (cycle == "Monthly") {
      if (payload.date) {
        start = moment(payload.date).startOf('month');
        end = moment(payload.date).endOf('month');
      } else {
        start = moment().startOf('month');
        end = moment().endOf('month');
      }
    } else {
      if (payload.date) {
        start = moment(payload.date).startOf('day');
        end = moment(payload.date).endOf('day');
      } else {
        start = moment().startOf('day');
        end = moment().endOf('day');
      }

    }

    const params = {
      userId: payload.userId,
      documents: data,
      docType: 'actions',
      page: permissionConst.entityDetail.pageId,
      component: ''
    };
    permissionsHelper.embed(params)
      .then(async (res) => {
        pointer.set(data, '/actions', res.pageActions);

        if (config.get('database', 'postgres') == 'mssql') {
          console.log("<here>")
          let conn = await sqlserver.connection()
          let { recordset } = await conn.request().query(`select sum(amount) as amount,sum(hits) as hits,route from billingreport where orgcode='${data.spCode}' and
          startdate>='${moment(start).format('YYYY-MM-DD 00:00:00')}' and enddate<= '${moment(end).format('YYYY-MM-DD 11:59:00')}'
          group by route`);
          conn.close();
          response["entityDetail"]["data"] = data;
          _.set(response, 'entityDetail.data.billing', recordset);
          entityGetCB(response);
        } else {
          console.log("<herepg>")
          let conn = await pg.connection();
          
          let reslt = await conn.query(`select sum(amount) as amount,sum(hits) as hits,route from billingreport where orgcode='${data.spCode}'
          and startdate>='${moment(start).format('YYYY-MM-DD 00:00:00')}' and enddate<='${moment(end).format('YYYY-MM-DD 11:59:00')}'
          group by route`);
          console.log("<ready>")
          response["entityDetail"]["data"] = data;
          _.set(response, 'entityDetail.data.billing', reslt.rows);
          _.set(response, 'entityDetail.data.from', moment(start).format('YYYY-MM-DD 00:00:00'));
          _.set(response, 'entityDetail.data.to', moment(end).format('YYYY-MM-DD 11:59:00'));
          entityGetCB(response);
        }


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
