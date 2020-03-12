'use strict';

const models = require('../../../../lib/models/index');
const connector = require('../../../../core/api/client/index');


module.exports = {
  start,
  upsertAccount,
  selectAccounts,
  selectTotalCount,
};


function upsertAccount(payload) {

}

async function start(conStr){
  return await connector.createClient('pg', conStr.pg);
}

async function selectAccounts(pg) {
  return pg.query("SELECT * FROM accounts");
}

async function selectTotalCount(pg) {
  return pg.query("SELECT count(hyperkey) FROM accounts");
}