'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const dates = require('../../../../lib/helpers/dates');
function getDatastoreList(payload, UUIDKey, route, callback, JWToken) {
  let queryData = 'SELECT * FROM datastore_elems WHERE 1=1 ';
  let queryCnt = 'SELECT count(*) FROM datastore_elems WHERE 1=1 ';
  let query = '';
  if (payload.searchCriteria && payload.searchCriteria.toDate && payload.searchCriteria.fromDate) {
    let fromdate = dates.ddMMyyyyslash(payload.searchCriteria.fromDate);
    let todate = dates.ddMMyyyyslash(payload.searchCriteria.toDate);
    query += ` AND date_part('epoch'::text,"createdAt")::bigint between  ${fromdate / 1000} AND ${todate / 1000} `;
  }

  if (payload.searchCriteria && payload.searchCriteria.dataStructureName) {
    let dataStructureName = payload.searchCriteria.dataStructureName;
    query += ` AND "tranxData"->>'dataStructureName' like '%${dataStructureName}%' =  `;
  }

  if (payload.searchCriteria && payload.searchCriteria.key) {
    let key = payload.searchCriteria.key;
    query += ` AND "key" like '%${key}%'`;
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
          dataStructureName: elemt.tranxData.dataStructureName,
          key: elemt.tranxData.key,
          keyAttrValue: elemt.tranxData.keyAttrValue,
          createdon: elemt.createdAt,
          updatedon: elemt.updatedAt
        });
      });
      let response = {
        "getDatastoreList": {
          "action": "getDatastoreList",
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

function getDatastoreDetail(payload, UUIDKey, route, callback, JWToken) {
  let queryData = `SELECT 
  data."tranxData" as data, 
  ds."tranxData" as structure, 
  data.block_num as block_num, 
  data.txnid as txnid, 
  data."updatedAt" as "updatedAt"
  FROM datastore_elems data inner join datastructures ds 
  on data."tranxData"->>'dataStructureName'=ds.key 
  WHERE data.key='${payload.key}' `;

  pg.connection().then((conn) => {
    return conn.query(queryData, []).then((data) => {
      let response = {
        "getDatastoreDetail": {
          "action": "getDatastoreList",
          "data": data
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}

exports.getDatastoreList = getDatastoreList;
exports.getDatastoreDetail = getDatastoreDetail;