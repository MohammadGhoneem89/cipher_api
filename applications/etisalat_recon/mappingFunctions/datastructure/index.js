'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const dates = require('../../../../lib/helpers/dates');
const _ = require('lodash');
function getDatastructureList(payload, UUIDKey, route, callback, JWToken) {
  let queryData = 'SELECT * FROM datastructures WHERE 1=1 ';
  let queryCnt = 'SELECT count(*) FROM datastructures WHERE 1=1 ';
  let query = '';
  if (payload.searchCriteria && payload.searchCriteria.toDate && payload.searchCriteria.fromDate) {
    let fromdate = dates.ddMMyyyyslash(payload.searchCriteria.fromDate);
    let todate = dates.ddMMyyyyslash(payload.searchCriteria.toDate);
    query += ` AND date_part('epoch'::text,"createdAt")::bigint between  ${fromdate / 1000} AND ${todate / 1000} `;
  }

  if (payload.searchCriteria && payload.searchCriteria.keyAttributeName) {
    let keyAttributeName = payload.searchCriteria.keyAttributeName;
    query += ` AND "tranxData"->'dataStructure'->>'keyAttributeName' like '%${keyAttributeName}%' `;
  }

  if (payload.searchCriteria && payload.searchCriteria.name) {
    let name = payload.searchCriteria.name;
    query += ` AND "tranxData"->'dataStructure'->>'name' like '%${name}%' `;
  }

  let queryCriteria = queryCnt + query;
  let queryCriteriaFull = queryData + query;
  if (payload.page) { queryCriteriaFull += ` order by "createdAt" desc limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`; }
  pg.connection().then((conn) => {
    return Promise.all([
      conn.query(queryCriteria, []),
      conn.query(queryCriteriaFull, [])
    ]).then((data) => {
      let outVal = [];
      data[1].rows.forEach((elemt) => {
        outVal.push({
          name: elemt.tranxData.dataStructure.name,
          keyAttributeName: elemt.tranxData.dataStructure.keyAttributeName,
          description: elemt.tranxData.dataStructure.description,
          createdon: elemt.createdAt,
          updatedon: elemt.updatedAt
        });
      });
      let response = {
        "getDatastructureList": {
          "action": "getDatastructureList",
          "pageData": {
            "pageSize": payload.page.pageSize,
            "currentPageNo": payload.page.currentPageNo,
            "totalRecords": data[0].rows[0].count
          },
          "data": {
            "searchResult": outVal
          }
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}

function getDatastructureDetail(payload, UUIDKey, route, callback, JWToken) {
  let queryData = `SELECT * FROM datastructures WHERE key='${payload.key}' `;
  pg.connection().then((conn) => {
    return conn.query(queryData, []).then((data) => {
      let response = {
        "getDatastructureDetail": {
          "action": "getDatastructureDetail",
          "data": _.get(data, 'rows[0].tranxData', {})
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}

function getAttributeTypeRule(payload, UUIDKey, route, callback, JWToken) {
  let queryData = `SELECT * FROM datastructures `;

  // 1)	[Data Structure].[Attribute Name] if used means that take current value of the data structure and attribute from the blockchain and use that for comparison. For recon attribute it will be the reconciled value or if not reconciled then golden value specified as per rules.
  // 2)	[Data Structure].[Attribute Name].[System] is also allowed for recon attribute that means that use the value of the specific system rather than reconciled value.
  // 3)	[Data Structure].[Attribute Name].isReconciled is used to check for recon attributes if they are reconciled or not.
  // 4)	[Data Structure].[Attribute Name].lastVersion  --not in scope-- for any attribute means that take the previous value and not the current changed value. This allows for rules like if Device status changed from “ACTIVE” to others then Device.status.lastVersion == “ACTIVE” and Device.status <> Device.status.lastVersion can be used to configure the rule.
  // 5)	[Data Structure].IsPending means to check if as part of correction the record is marked as pending. Based on background scheduler it will be automatically cleared after X days based on definition of the correction rule.
  // 6)	[Data Structure].[Attribute].lastChanged gives a date when the record was last updated. This can be used in case of temporal rules like attribute not changed for last 15 days.

  pg.connection().then((conn) => {
    return conn.query(queryData, []).then((dataMain) => {
      let outObj = {};

      dataMain.rows.forEach((elem) => {
        let outVal = [];
        for (let key in elem.tranxData.attributeList) {
          let systems = Object.keys(elem.tranxData.attributeList[key].systems);
          systems.forEach((sys) => {
            outVal.push({
              "label": `${key}.${sys}`,
              "value": `${key}.${sys}`
            });
          });
          outVal.push({
            "label": `${key}.isReconciled`,
            "value": `${key}.isReconciled`
          });
          outVal.push({
            "label": `${key}.lastChanged`,
            "value": `${key}.lastChanged`
          });
          outVal.push({
            "label": `${elem.tranxData.dataStructure.name}.IsPending`,
            "value": `${elem.tranxData.dataStructure.name}.IsPending`
          });
        }
        _.set(outObj, elem.tranxData.dataStructure.name, outVal);
      });

      let response = {
        "getAttributeType": {
          "action": "getAttributeType",
          "data": outObj
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}
exports.getDatastructureList = getDatastructureList;
exports.getDatastructureDetail = getDatastructureDetail;
exports.getAttributeTypeRule = getAttributeTypeRule;
