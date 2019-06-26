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
  pg.connection().then((conn) => {
    return conn.query(queryData, []).then((dataMain) => {
      let outObj = {};

      dataMain.rows.forEach((elem) => {
        let outVal = [];
        for (let key in elem.tranxData.attributeList) {
          let systems = Object.keys(elem.tranxData.attributeList[key].systems);
          systems.forEach((sys) => {
            outVal.push({
              "label": `${key}.attributesValue.${sys}`,
              "value": `${key}.attributesValue.${sys}`
            });
          });
          outVal.push({
            "label": `${key}.isReconciled`,
            "value": `${key}.isReconciled`
          });
          outVal.push({
            "label": `${key}.timeStamp`,
            "value": `${key}.timeStamp`
          });
          
          // outVal.push({
          //   "label": `${elem.tranxData.dataStructure.name}.timeStamp`,
          //   "value": `${elem.tranxData.dataStructure.name}.IsPending`
          // });
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
