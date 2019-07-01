'use strict';
const pg = require('../../../../core/api/connectors/postgress');
const dates = require('../../../../lib/helpers/dates');
const _ = require('lodash');
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

  let queryRules = `Select r.datastructure, 
     r.datastructureid, r.notification, r.correction, 
     r.id as internalid, r.ruleid, r.datetime, nr.* 
      from public."ruleauditlog" r inner join
    "NotificationsRule" nr  on  nr.id=r.ruleid where r.datastructureid='${payload.key}'`;

  pg.connection().then((conn) => {

    return Promise.all([
      conn.query(queryData, []),
      conn.query(queryRules, [])
    ]).then((data) => {

      let AttrList = [];
      let AttrListReconFinal = [];
      let record = data[0].rows[0];
      let attList = _.get(record, 'data.attributeList', undefined);
      let schema = _.get(record, 'structure.attributeList', undefined);
      let schemaBasic = _.get(record, 'structure', undefined);
      let reconStatus = true;
      let generalData = {
        id: payload.key.replace(`${schemaBasic.dataStructure.name}_`, ''),
        blockNum: record.block_num,
        txnid: record.txnid,
        updatedAt: record.updatedAt,
        keyAttributeName: schemaBasic.dataStructure.keyAttributeName,
        dsName: schemaBasic.dataStructure.name
      };
      _.set(generalData, '', undefined);
      if (attList && schema) {
        for (let key in attList) {
          let attrVal = _.get(schema, `${key}`, undefined);
          if (attrVal) {
            if (_.get(attrVal, `attribute.reconType`, "360") == "360") {
              let system = Object.keys(attrVal.systems)[0];
              AttrList.push({
                system: system,
                value: _.get(attList, `${key}.attributesValue.${system}`, ""),
                name: _.get(attrVal, `attribute.attributeLabel`, key) || key,
                sequence: parseInt(_.get(attrVal, `attribute.sequence`, "999") || "999", 10)
              });
            }
            else {
              let AttrListRecon = [];
              let reconStat = true;
              Object.keys(attrVal.systems).forEach((elem) => {
                let isReconcile = _.get(attList, `${key}.isReconciled`, false);
                AttrListRecon.push({
                  system: elem,
                  value: _.get(attList, `${key}.attributesValue.${elem}`, ""),
                  isRecon: isReconcile
                });
                if (!isReconcile) {
                  reconStatus = false
                  reconStat = false;
                }
              });
              AttrListReconFinal.push({
                name: _.get(attrVal, `attribute.attributeLabel`, key) || key,
                value: AttrListRecon,
                isRecon: reconStat
              });
            }
          }
        }
      }
      AttrList = _.orderBy(AttrList, 'sequence', 'desc');
      let relationshipData = [];

      schemaBasic.relationshipData.forEach((data) => {
        relationshipData.push(data.relatedTo);
      });

      let relList = _.get(record, 'data.relationList', {});
      let AttrListRecon = [];
      let actions = [{
        "value": "1003",
        "type": "componentAction",
        "label": "View",
        "params": "",
        "iconName": "icon-docs",
        "URI": [
          "/etisalat/datastoreview/"
        ]
      }];
      Object.keys(relList).forEach((elem) => {
        let arrList = [];
        relList[elem].forEach((data) => {
          arrList.push({
            dsName: elem,
            key: data,
            actions: actions
          });
        });
        AttrListRecon.push({
          dsName: elem,
          list: arrList
        });
      });

      let response = {
        "getDatastoreDetail": {
          "action": "getDatastoreList",
          "data": {
            AttrList: AttrList,
            AttrListReconFinal: AttrListReconFinal,
            meta: generalData,
            relationshipData: AttrListRecon,
            reconStatus: reconStatus,
            notificationList: data[1].rows
          }
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}

function firstN(obj, n) {
  return Object.keys(obj)
    .slice(0, n)
    .reduce(function (memo, current) {
      memo[current] = obj[current];
      return memo;
    }, {});
}
exports.getDatastoreList = getDatastoreList;
exports.getDatastoreDetail = getDatastoreDetail;