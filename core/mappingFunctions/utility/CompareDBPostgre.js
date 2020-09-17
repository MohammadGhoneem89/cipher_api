"use strict";
const _ = require("lodash");
const factory = require('../../../core/api/client/index');
const endpointDefination = require('../../../lib/repositories/endpointDefination');
const sequalize = require('../../api/client/sequelize');

function dbCompare(source, destination, sourceColumns, destinationColumns) {
  if (source.length > 0) {
    let tablesArray;
    let differentColumn = [];
    for (let i = 0; i < destination.length; i++) {
      for (let j = 0; j < source.length; j++) {
        if (destination[i].table_name == source[j].table_name) {
          differentColumn = destination.filter(
            ({
              table_name: id1
            }) => source.some(({
              table_name: id2
            }) => id2 === id1)
          );
        } else {
          tablesArray = destination.filter(
            ({
              table_name: id1
            }) => !source.some(({
              table_name: id2
            }) => id2 === id1)
          );
        }
      }
    }
    let val = []
    for (let i = 0; i < tablesArray.length; i++) {
      val.push({
        tableName: tablesArray[i].table_name,
        type: "new",
        columns: []
      });
      val[i].columns.push({
        name: tablesArray[i].column_name,
        type: tablesArray[i].data_type,
        length: tablesArray[i].character_maximum_length,
        isNullable: tablesArray[i].is_nullable,
        isIdentity: tablesArray[i].is_identity

      })
    }
    var newTable = val.reduce(function (o, cur) {
      var occurs = o.reduce(function (n, item, i) {
        return item.tableName === cur.tableName ? i : n;
      }, -1);
      if (occurs >= 0) {
        o[occurs].columns = o[occurs].columns.concat(cur.columns);
      } else {
        var obj = {
          tableName: cur.tableName,
          type: "new",
          columns: cur.columns
        };
        o = o.concat([obj]);
      }
      return o;
    }, []);
    let val2 = [];
    let arr = []
    let sourceMap = new Map();
    for (let i = 0; i < source.length; i++) {
      let tempArr = []
      if (sourceMap.has(source[i].column_name) && sourceMap.get(source[i].column_name) != source[i].table_name) {
        tempArr = sourceMap.get(source[i].column_name)
        tempArr.push(source[i].table_name)
      } else {
        tempArr.push(source[i].table_name)
      }
      sourceMap.set(source[i].column_name, tempArr)
    }
    for (let j = 0; j < differentColumn.length; j++) {
      if (!sourceMap.has(differentColumn[j].column_name)) {
        arr.push(differentColumn[j].column_name)
        val2.push({
          tableName: differentColumn[j].table_name,
          type: "update",
          columns: {
            name: differentColumn[j].column_name,
            type: differentColumn[j].data_type,
            length: differentColumn[j].character_maximum_length,
            isNullable: differentColumn[j].is_nullable,
            isIdentity: differentColumn[j].is_identity
          }
        });
      } else {
        let tableName = sourceMap.get(differentColumn[j].column_name)
        if (!tableName.includes(differentColumn[j].table_name)) {
          arr.push(differentColumn[j].column_name)
          val2.push({
            tableName: differentColumn[j].table_name,
            type: "update",
            columns: {
              name: differentColumn[j].column_name,
              type: differentColumn[j].data_type,
              length: differentColumn[j].character_maximum_length,
              isNullable: differentColumn[j].is_nullable,
              isIdentity: differentColumn[j].is_identity
            }
          });
        }
      }
    }
    let val3 = [];
    let arr2 = []
    for (let i = 0; i < source.length; i++) {
      let tempArr = []
      if (sourceMap.has(source[i].data_type) && sourceMap.get(source[i].data_type) != source[i].table_name) {
        tempArr = sourceMap.get(source[i].data_type)
        tempArr.push(source[i].table_name)
      } else {
        tempArr.push(source[i].table_name)
      }
      sourceMap.set(source[i].data_type, tempArr)
    }
    for (let j = 0; j < differentColumn.length; j++) {
      if (!sourceMap.has(differentColumn[j].data_type)) {
        arr2.push(differentColumn[j].data_type)
        val3.push({
          tableName: differentColumn[j].table_name,
          type: "updated-col-type",
          columns: {
            name: differentColumn[j].column_name,
            type: differentColumn[j].data_type,
            length: differentColumn[j].character_maximum_length,
            isNullable: differentColumn[j].is_nullable,
            isIdentity: differentColumn[j].is_identity
          }
        });
      } else {
        let tableName = sourceMap.get(differentColumn[j].data_type)
        if (!tableName.includes(differentColumn[j].table_name)) {
          arr2.push(differentColumn[j].data_type)
          val3.push({
            tableName: differentColumn[j].table_name,
            type: "updated-col-type",
            columns: {
              name: differentColumn[j].column_name,
              type: differentColumn[j].data_type,
              length: differentColumn[j].character_maximum_length,
              isNullable: differentColumn[j].is_nullable,
              isIdentity: differentColumn[j].is_identity
            }
          });
        }
      }
    }
    var output3 = val3.reduce(function (o, cur) {
      var occurs = o.reduce(function (n, item, i) {
        return item.tableName === cur.tableName ? i : n;
      }, -1);
      if (occurs >= 0) {
        o[occurs].columns = o[occurs].columns.concat(cur.columns);
      } else {
        var obj = {
          tableName: cur.tableName,
          type: "updated-col-type",
          columns: [cur.columns],
        };
        o = o.concat([obj]);
      }
      return o;
    }, []);

    var output2 = val2.reduce(function (o, cur) {
      var occurs = o.reduce(function (n, item, i) {
        return item.tableName === cur.tableName ? i : n;
      }, -1);
      if (occurs >= 0) {
        o[occurs].columns = o[occurs].columns.concat(cur.columns);
      } else {
        var obj = {
          tableName: cur.tableName,
          type: "Updated",
          columns: [cur.columns],
        };
        o = o.concat([obj]);
      }
      return o;
    }, []);
    output2 = output2.concat(output3)
    return newTable.concat(output2)
  } else {
    let newTable = [];
    for (let i = 0; i < destination.length; i++) {
      newTable.push({
        tableName: destination[i].table_name,
        type: "new",
        columns: {
          name: destination[i].column_name,
          type: destination[i].data_type,
          length: destination[i].character_maximum_length,
          isNullable: destination[i].is_nullable,
          isIdentity: destination[i].is_identity
        }
      });
      var output2 = newTable.reduce(function (o, cur) {
        var occurs = o.reduce(function (n, item, i) {
          return item.tableName === cur.tableName ? i : n;
        }, -1);
        if (occurs >= 0) {
          o[occurs].columns = o[occurs].columns.concat(cur.columns);
        } else {
          var obj = {
            tableName: cur.tableName,
            type: "new",
            columns: [cur.columns],
          };
          o = o.concat([obj]);
        }
        return o;
      }, []);
    }
    return output2;
  }
}

async function ApplyScriptPostgreSql(payload, UUIDKey, route, callback, JWToken) {
  let DestinationDB = payload.body.Destination
  // let pg2 = await factory.createClient('pg', `postgresql://Admin:avanza123@23.97.138.116:5432/${DestinationDB}?idleTimeoutMillis=3000000`);

  let pg2 = undefined;

  try {
    let endpoint = await endpointDefination.findOne({
      id: payload.body.Destination
    });
    pg2 = await sequalize(endpoint.address, endpoint.protocol.secure);
  } catch (err) {
    return callback(err);
  }


  if (payload) {

    let mainQuery = payload.body.script.mainQuery
    try {
      let results2 = await pg2.query(`${mainQuery}`)
    } catch (err) {
      return callback(err);
    }
  }
}

async function WriteScriptPostgreSql(payload, UUIDKey, route, callback, JWToken) {
  if (payload.body && payload.body.tables) {
    let table = payload.body.tables
    for (let i = 0; i < table.length; i++) {
      if (table[i].type == 'new') {
        let query = ''
        for (let j = 0; j < table[i].columns.length; j++) {
          query += `${table[i].columns[j].name} ${table[i].columns[j].type}${table[i].columns[j].length==null?'':`(${table[i].columns[j].length})`} ${table[i].columns[j].isNullable=='NO'?'NOT NULL':'NULL'}, `
        }
        let mainQuery = `CREATE TABLE public.${table[i].tableName} (${query})`
        mainQuery = mainQuery.slice(0, mainQuery.length - 3)
        mainQuery = `${mainQuery})`
        let response = {
          data: {
            mainQuery
          },
        };
        callback({
          response
        });
      } else if (table[i].type == 'updated-col-type') {
        let query = ''
        for (let j = 0; j < table[i].columns.length; j++) {
          query += `ALTER COLUMN ${table[i].columns[j].name} TYPE ${table[i].columns[j].type} ${table[i].columns[j].length==null?'':`(${table[i].columns[j].length})`}${table[i].columns[j].isNullable=='NO'?'NOT NULL':''} USING ${table[i].columns[j].name}:: ${table[i].columns[j].type}, `
        }
        let mainQuery = `ALTER TABLE public.${table[i].tableName} ${query}`
        mainQuery = mainQuery.slice(0, mainQuery.length - 2)
        mainQuery = `${mainQuery}`
        let response = {
          data: {
            mainQuery
          },
        };
        callback({
          response
        });

      } else {
        let query = ''
        for (let j = 0; j < table[i].columns.length; j++) {
          query += `ADD ${table[i].columns[j].name} ${table[i].columns[j].type} ${table[i].columns[j].length==null?'':`(${table[i].columns[j].length})`}${table[i].columns[j].isNullable=='NO'?'NOT NULL':'NULL'}, `
        }
        let mainQuery = `ALTER TABLE public.${table[i].tableName} ${query}`
        mainQuery = mainQuery.slice(0, mainQuery.length - 2)
        mainQuery = `${mainQuery}`
        let response = {
          data: {
            mainQuery
          },
        };
        callback({
          response
        });
      }
    }
  }
}

async function CompareDBPostgre(payload, UUIDKey, route, callback, JWToken) {
  if (payload.body) {
    let pg = undefined;
    try {
      let endpoint = await endpointDefination.findOne({
        id: payload.body.Source
      });
      pg = await sequalize(endpoint.address, endpoint.protocol.secure);
    } catch (err) {
      return callback(err);
    }
    let pg2 = undefined;
    try {
      let endpoint = await endpointDefination.findOne({
        id: payload.body.Destination
      });
      pg2 = await sequalize(endpoint.address, endpoint.protocol.secure);
    } catch (err) {
      return callback(err);
    }
    try {
      let source = `SELECT * FROM information_schema.columns where table_schema='public'`;
      let results = await pg.query(source)
      let destination = `SELECT * FROM information_schema.columns where table_schema='public'`;
      let results2 = await pg2.query(destination)
      let tables = dbCompare(results2[0], results[0])
      let vaar
      for (let i = 0; i < tables.length; i++) {
        vaar = JSON.stringify(tables[i].columns)
        tables[i].new = vaar
      }
      let response = {
        data: {
          tables
        },
      };
      callback({
        response
      });
    } catch (err) {
      return callback(err);
    }
  }
}
module.exports = {
  CompareDBPostgre,
  WriteScriptPostgreSql,
  ApplyScriptPostgreSql
};