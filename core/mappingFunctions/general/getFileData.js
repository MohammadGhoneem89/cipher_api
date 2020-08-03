'use strict';
const pg = require('../../../core/api/connectors/postgress');
const _ = require('lodash');
const sqlserver = require('../../api/connectors/mssql');
const config = require('../../../config');
const sql = require('mssql');

let getFileDataPG = function (payload, UUIDKey, route, callback, JWToken) {

  let params = []

  let queryFile = 'SELECT * FROM file_details WHERE id=$1::int';
  let queryData = 'SELECT * FROM file_contents WHERE fileid=$1::int';
  let queryCnt = 'SELECT COUNT(*) FROM file_contents WHERE fileid=$1::int ';

  params.push(payload.id)

  if (payload.searchCriteria) {
    if (payload.searchCriteria.status) {
      if (payload.searchCriteria.status.length == 1) {
        queryData += ' AND status=$2::int '
        queryCnt += ' AND status=$2::int '

        params.push(payload.searchCriteria.status[0])
      } else {
        queryData += ' AND status In ($2::int, $3::int) '
        queryCnt += ' AND status In ($2::int, $3::int) '

        params.push(payload.searchCriteria.status[0])
        params.push(payload.searchCriteria.status[1])
      }
    }
    if (payload.searchCriteria.rulename) {
      queryData += ` AND rulename=$${params.length + 1}::varchar `
      queryCnt += ` AND rulename=$${params.length + 1}::varchar `
      params.push(payload.searchCriteria.rulename)
    }
  }
  // queryData += ' ORDER BY datetime DESC';


  if (payload.page) {
    queryData += ` limit ${payload.page.pageSize} OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)}`;
  }

  console.log("===", queryFile)
  console.log("+++", queryData)
  console.log("---", queryCnt)

  pg.connection().then((conn) => {
    return Promise.all([
      conn.query(queryFile, [payload.id]),
      conn.query(queryData, params),
      conn.query(queryCnt, params),
    ]).then((data) => {
      let outVal = [];
      data[1].rows.forEach((elemt) => {
        let element = _.clone(elemt)
        element.action = [{ "actionType": "COMPONENT_FUNCTION", iconName: "fa fa-eye", label: "view" }]
        outVal.push(element);
      })

      let response = {
        "getFileData": {
          "action": "getFileData",
          "pageData": {
            "pageSize": payload.page.pageSize,
            "currentPageNo": payload.page.currentPageNo,
            "totalRecords": data[2].rows[0].count
          },
          "data": {
            "searchResult": {
              fileDetails: data[0].rows,
              fileData: outVal
            }
          }
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}



let getFileDataMSSQL = function (payload, UUIDKey, route, callback, JWToken) {

  let params = []

  let queryFile = 'SELECT * FROM file_details WHERE id=@id';
  let queryData = 'SELECT * FROM file_contents WHERE fileid=@id';
  let queryCnt = 'SELECT COUNT(*) FROM file_contents WHERE fileid=@id ';

  console.log("===", queryFile)
  console.log("+++", queryData)
  console.log("---", queryCnt)

  sqlserver.connection().then((conn) => {

    let request = conn.request();
    request.input('id', sql.VarChar, payload.id)
    if (payload.searchCriteria) {
      if (payload.searchCriteria.status) {
        if (payload.searchCriteria.status.length == 1) {
          queryData += ' AND status=@status '
          queryCnt += ' AND status=@status '
          params.push(payload.searchCriteria.status[0])
        } else {
          queryData += ' AND status In (@status1, @status2) '
          queryCnt += ' AND status In (@status1, @status2) '
          request.input('status1', sql.VarChar, payload.status[0])
          request.input('status2', sql.VarChar, payload.status[1])
        }
      }
      if (payload.searchCriteria.rulename) {
        queryData += ` AND rulename=@rulename `
        queryCnt += ` AND rulename=@rulename `
        request.input('rulename', sql.VarChar, payload.searchCriteria.rulename)

      }
    }
    queryData += ' ORDER BY datetime DESC';


    if (payload.page) {
      queryData += ` OFFSET ${payload.page.pageSize * (payload.page.currentPageNo - 1)} ROWS FETCH NEXT  ${payload.page.pageSize} ROWS ONLY `;
    }
    return Promise.all([
      request.query(queryFile),
      request.query(queryData),
      request.query(queryCnt),
    ]).then((data) => {
      conn.close();
      let outVal = [];
      data[1].recordset.forEach((elemt) => {
        let element = _.clone(elemt)
        element.action = [{ "actionType": "COMPONENT_FUNCTION", iconName: "fa fa-eye", label: "view" }]
        outVal.push(element);
      })

      let response = {
        "getFileData": {
          "action": "getFileData",
          "pageData": {
            "pageSize": payload.page.pageSize,
            "currentPageNo": payload.page.currentPageNo,
            "totalRecords": data[2].recordset[0].count
          },
          "data": {
            "searchResult": {
              fileDetails: data[0].recordset,
              fileData: outVal
            }
          }
        }
      };
      return callback(response);
    });
  }).catch((err) => {
    console.log(err);
  });
}


if (config.get('database') == 'mssql') {
  exports.getFileData = getFileDataPG;
} else {
  exports.getFileData = getFileDataMSSQL
}