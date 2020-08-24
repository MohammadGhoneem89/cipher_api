'use strict'; 
const sequalize = require('../../api/client/sequelize');
const { QueryTypes } = require('sequelize');
async function logErrors(payload, UUIDKey, route, callback, JWToken, res) {
  let resp = {
    feedback: "OK!"
  };
  let connection = await sequalize();
  for (let item of payload.logList) {
    let qry = `insert into errorlogui (url, errorMessage, exp, username, code) values ('${item.url}','${item.errorMessage}','${item.exp}','${item.username}',${item.code}) `
    await connection.query(qry, {
      logging: console.log,
      plain: false,
      raw: false,
      type: QueryTypes.INSERT
    });
  }
  callback(resp);
}
exports.logErrors = logErrors;

