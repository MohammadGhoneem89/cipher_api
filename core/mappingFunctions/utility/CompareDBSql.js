"use strict";
const {
  stringify
} = require("uuid");
const endpointDefination = require('../../../lib/repositories/endpointDefination');
const sequalize = require('../../api/client/sequelize');

function dbCompare(destination, source, destinationColumns, sourceColumns) {
  if (destination.length > 0) {
    let tablesArray;
    let differentColumn = [];
    let differentColumn2 = [];
    let differentColumn3 = [];
    for (let i = 0; i < source.length; i++) {
      for (let j = 0; j < destination.length; j++) {
        if (source[i].name == destination[j].name) {
          differentColumn = sourceColumns.filter(
            ({
              name: id1,
            }) => !destinationColumns.some(({
              name: id2,
            }) => id2 == id1)
          );
          differentColumn2 = sourceColumns.filter(
            ({
              name: id1,
              TypeName: id11
            }) => !destinationColumns.some(({
              name: id2,
              TypeName: id22
            }) => id2 == id1 && id22 == id11)
          );
          differentColumn3 = differentColumn2.filter(
            ({
              name: id1,
            }) => !differentColumn.some(({
              name: id2,
            }) => id2 == id1)
          );
        } else {
          tablesArray = source.filter(
            ({
              name: id1
            }) => !destination.some(({
              name: id2
            }) => id2 === id1)
          );
        }
      }
    }
    let newTable = [];
    for (let i = 0; i < tablesArray.length; i++) {
      newTable.push({
        tableName: tablesArray[i].name,
        type: "new",
        column: [],
      });
      for (let j = 0; j < sourceColumns.length; j++) {
        if (tablesArray[i].object_id === sourceColumns[j].object_id) {
          newTable[i].column.push({
            name: sourceColumns[j].name,
            type: sourceColumns[j].TypeName,
            length: sourceColumns[j].TypeName == 'int' || sourceColumns[j].TypeName == 'text' || sourceColumns[j].TypeName == 'date' || sourceColumns[j].TypeName == 'smallint' || sourceColumns[j].TypeName == 'datetime' || sourceColumns[j].TypeName == 'bigint' || sourceColumns[j].TypeName == 'datetimeoffset' ? '' : sourceColumns[j].max_length == 0 || sourceColumns[j].max_length == -1 ? 'max' : sourceColumns[j].TypeName == 'nvarchar' ? Math.round((sourceColumns[j].max_length) / 2) : sourceColumns[j].max_length,
            isNullable: sourceColumns[j].isNullable,
            isIdentity: sourceColumns[j].isIdentity
          });
        }
      }
    }
    let val = [];
    for (let i = 0; i < differentColumn.length; i++) {
      for (let j = 0; j < source.length; j++) {
        for (let k = 0; k < sourceColumns.length; k++) {
          if (
            differentColumn[i].object_id == sourceColumns[k].object_id &&
            differentColumn[i].name == sourceColumns[k].name &&
            source[j].object_id == differentColumn[i].object_id
          ) {
            val.push({
              tableName: source[j].name,
              type: "updated",
              column: [],
            });
          }
        }
      }
      val[i].column.push({
        name: differentColumn[i].name,
        type: differentColumn[i].TypeName,
        length: differentColumn[i].TypeName == 'int' || differentColumn[i].TypeName == 'text' || differentColumn[i].TypeName == 'date' || differentColumn[i].TypeName == 'smallint' || differentColumn[i].TypeName == 'datetime' || differentColumn[i].TypeName == 'bigint' || differentColumn[i].TypeName == 'datetimeoffset' ? '' : differentColumn[i].max_length == 0 || differentColumn[i].max_length == -1 ? 'max' : differentColumn[i].TypeName == 'nvarchar' ? Math.round((differentColumn[i].max_length) / 2) : differentColumn[i].max_length,
        isNullable: differentColumn[i].isNullable,
        isIdentity: differentColumn[i].isIdentity
      });
    }
    let diffCol = [];
    for (let i = 0; i < differentColumn3.length; i++) {
      for (let j = 0; j < source.length; j++) {
        for (let k = 0; k < sourceColumns.length; k++) {
          if (
            differentColumn3[i].object_id == sourceColumns[k].object_id &&
            differentColumn3[i].name == sourceColumns[k].name &&
            source[j].object_id == differentColumn3[i].object_id
          ) {
            diffCol.push({
              tableName: source[j].name,
              type: "updated-col-type",
              column: [],
            });
          }
        }
      }
      diffCol[i].column.push({
        name: differentColumn3[i].name,
        type: differentColumn3[i].TypeName,
        length: differentColumn3[i].TypeName == 'int' || differentColumn3[i].TypeName == 'text' || differentColumn3[i].TypeName == 'date' || differentColumn3[i].TypeName == 'smallint' || differentColumn3[i].TypeName == 'datetime' || differentColumn3[i].TypeName == 'bigint' || differentColumn3[i].TypeName == 'datetimeoffset' ? '' : differentColumn3[i].max_length == 0 || differentColumn3[i].max_length == -1 ? 'max' : differentColumn3[i].TypeName == 'nvarchar' ? Math.round((differentColumn3[i].max_length) / 2) : differentColumn3[i].max_length,
        isNullable: differentColumn3[i].isNullable,
        isIdentity: differentColumn3[i].isIdentity
      });
    }
    var output3 = diffCol.reduce(function (o, cur) {
      var occurs = o.reduce(function (n, item, i) {
        return item.tableName === cur.tableName ? i : n;
      }, -1);
      if (occurs >= 0) {
        o[occurs].column = o[occurs].column.concat(cur.column);
      } else {
        var obj = {
          tableName: cur.tableName,
          type: "updated-col-type",
          column: cur.column,
        };
        o = o.concat([obj]);
      }
      return o;
    }, []);
    var output2 = val.reduce(function (o, cur) {
      var occurs = o.reduce(function (n, item, i) {
        return item.tableName === cur.tableName ? i : n;
      }, -1);
      if (occurs >= 0) {
        o[occurs].column = o[occurs].column.concat(cur.column);
      } else {
        var obj = {
          tableName: cur.tableName,
          type: "Updated",
          column: cur.column,
        };
        o = o.concat([obj]);
      }
      return o;
    }, []);
    let finalResult = newTable.concat(output2);
    var finalResult2 = finalResult.reduce(function (o, cur) {
      var occurs = o.reduce(function (n, item, i) {
        return item.tableName === cur.tableName ? i : n;
      }, -1);
      if (occurs >= 0) {
        o[occurs].column = o[occurs].column;
      } else {
        var obj = {
          tableName: cur.tableName,
          type: cur.type,
          column: cur.column,
        };
        o = o.concat([obj]);
      }
      return o;
    }, []);
    return finalResult2.concat(output3);
  } else {
    let newTable = [];
    for (let i = 0; i < source.length; i++) {
      newTable.push({
        tableName: source[i].name,
        type: "new",
        column: [],
      });
      for (let j = 0; j < sourceColumns.length; j++) {
        if (source[i].object_id === sourceColumns[j].object_id) {
          newTable[i].column.push({
            name: sourceColumns[j].name,
            type: sourceColumns[j].TypeName,
            length: sourceColumns[j].TypeName == 'int' || sourceColumns[j].TypeName == 'text' || sourceColumns[j].TypeName == 'date' || sourceColumns[j].TypeName == 'smallint' || sourceColumns[j].TypeName == 'datetime' || sourceColumns[j].TypeName == 'bigint' || sourceColumns[j].TypeName == 'datetimeoffset' ? '' : sourceColumns[j].max_length == 0 || sourceColumns[j].max_length == -1 ? 'max' : sourceColumns[j].TypeName == 'nvarchar' ? Math.round((sourceColumns[j].max_length) / 2) : sourceColumns[j].max_length,
            isNullable: sourceColumns[j].isNullable,
            isIdentity: sourceColumns[j].isIdentity
          });
        }
      }
    }
    return newTable;
  }
}

async function ApplyScriptSQL(payload, UUIDKey, route, callback, JWToken) {
  if (payload) {
    let connection2 = undefined;
    try {
      let endpoint = await endpointDefination.findOne({
        id: payload.body.Destination
      });
      connection2 = await sequalize(endpoint.address, endpoint.protocol.secure);
    } catch (err) {
      return callback(err);
    }

    if (payload.body.script) {
      for (let i = 0; i < payload.body.script.length; i++) {
        try {
          let destination = await connection2.query(`${payload.body.script[i].data}`)
        } catch (err) {
          return callback(err);
        }
      }
    }
  }
}
async function WriteScriptSQL(payload, UUIDKey, route, callback, JWToken) {
  if (payload.body && payload.body.tables) {
    let table = payload.body.tables
    let response = []
    let DestinationDB = payload.body.Destination
    try {
      for (let i = 0; i < table.length; i++) {
        if (table[i].type == 'new') {
          let query = ''
          for (let j = 0; j < table[i].column.length; j++) {
            query += `${table[i].column[j].name} ${table[i].column[j].type}${table[i].column[j].type == 'int' || table[i].column[j].type == 'text'||table[i].column[j].type == 'date'||table[i].column[j].type == 'smallint'||table[i].column[j].type == 'datetime'||table[i].column[j].type == 'bigint'||table[i].column[j].type == 'datetimeoffset'?`${table[i].column[j].length}`:`(${table[i].column[j].length})`} ${table[i].column[j].isNullable==false?'NOT NULL':'NULL'} ${table[i].column[j].isIdentity==false?'':'IDENTITY'}, `
          }
          let mainQuery = `CREATE TABLE ${DestinationDB}.dbo.${table[i].tableName} (${query})`
          response.push({
            data: mainQuery
          });
        } else if (table[i].type == 'updated-col-type') {
          let query = ''
          for (let j = 0; j < table[i].column.length; j++) {
            query += `${table[i].column[j].name} ${table[i].column[j].type}${table[i].column[j].type == 'int' || table[i].column[j].type == 'text'||table[i].column[j].type == 'date'||table[i].column[j].type == 'smallint'||table[i].column[j].type == 'datetime'?`${table[i].column[j].length}`:`${table[i].column[j].length}`?`(${table[i].column[j].length})`:''} ${table[i].column[j].isNullable==false?'NOT NULL':'NULL'} ${table[i].column[j].isIdentity==false?'':'IDENTITY'}, `
          }
          query = query.slice(0, query.length - 2)
          let mainQuery = `ALTER TABLE ${DestinationDB}.dbo.${table[i].tableName} ALTER COLUMN ${query}`
          response.push({
            data: mainQuery
          });
        } else {
          let query = ''
          for (let j = 0; j < table[i].column.length; j++) {
            query += `${table[i].column[j].name} ${table[i].column[j].type}${table[i].column[j].type == 'int' || table[i].column[j].type == 'text' || table[i].column[j].type == 'date' || table[i].column[j].type == 'smallint' || table[i].column[j].type == 'datetime'?`${table[i].column[j].length}`:`${table[i].column[j].length}`?`(${table[i].column[j].length})`:''} ${table[i].column[j].isNullable==false?'NOT NULL':'NULL'} ${table[i].column[j].isIdentity==false?'':'IDENTITY'}, `
          }
          query = query.slice(0, query.length - 2)
          let mainQuery = `ALTER TABLE ${DestinationDB}.dbo.${table[i].tableName} ADD ${query}`
          response.push({
            data: mainQuery
          });
        }
      }
    } catch (err) {
      return callback(err);
    }
    callback({
      response
    });
  }
}
async function CompareDBSql(payload, UUIDKey, route, callback, JWToken) {
  try {
    let connection1 = undefined;
    try {
      let endpoint = await endpointDefination.findOne({
        id: payload.body.Source
      });
      connection1 = await sequalize(endpoint.address, endpoint.protocol.secure);
    } catch (err) {
      return callback(err);
    }
    let connection2 = undefined;
    try {
      let endpoint = await endpointDefination.findOne({
        id: payload.body.Destination
      });
      connection2 = await sequalize(endpoint.address, endpoint.protocol.secure);
    } catch (err) {
      return callback(err);
    }
    if (payload.body) {
      try {
        let destination = `SELECT * from sys.objects where type='U'`;
        let source = `SELECT * from sys.objects where type='U'`;
        let destinationColumns = `SELECT
                                  c.name 'name',
                                  ty.Name 'TypeName',
                                  c.is_nullable 'isNullable',
                                  c.is_identity 'isIdentity',
                                  c.max_length, c.object_id
                                  FROM
                                  sys.tables t
                                  INNER JOIN
                                  sys.columns c ON t.object_id = c.object_id
                                  INNER JOIN
                                  sys.types ty ON c.user_type_id = ty.user_type_id`
        let sourceColumns = `SELECT
                              c.name 'name',
                              ty.Name 'TypeName',
                              c.is_nullable 'isNullable',
                              c.is_identity 'isIdentity',
                              c.max_length, c.object_id
                              FROM
                              sys.tables t
                              INNER JOIN
                              sys.columns c ON t.object_id = c.object_id
                              INNER JOIN
                              sys.types ty ON c.user_type_id = ty.user_type_id`
        let destination1 = await connection2.query(destination)
        let source1 = await connection1.query(source)
        let destinationColumns2 = await connection2.query(destinationColumns)
        let sourceColumns2 = await connection1.query(sourceColumns)
        let tables = dbCompare(
          destination1[0],
          source1[0],
          destinationColumns2[0],
          sourceColumns2[0]
        );
        let vaar = ''
        for (let i = 0; i < tables.length; i++) {
          vaar = JSON.stringify(tables[i].column)
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
  } catch (err) {
    return callback(err);
  }
}
exports.CompareDBSql = CompareDBSql;
exports.WriteScriptSQL = WriteScriptSQL;
exports.ApplyScriptSQL = ApplyScriptSQL;