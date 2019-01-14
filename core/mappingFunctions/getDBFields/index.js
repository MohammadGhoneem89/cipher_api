const client = require('../../api/client');
let logger = require('../../../lib/helpers/logger')().app;
const keyVaultRepo = require('../../../lib/repositories/keyVault');
const postgresProcess = require('./adaptors/postgres');
const getDBFields = async function (payload, UUIDKey, route, callback, JWToken) {
  const response = {
    getDBFields: {
      action: payload.action,
      data: []
    }
  };
  try {
    let dbConfig = await keyVaultRepo.getDBConfig(payload.database, payload.adaptor);
    let instance = await client.createClient(payload.database, dbConfig.connection);
    switch (payload.database) {
      case 'postgres':
        if (payload.objectType === 'table') {
          response.getDBFields.data = await postgresProcess(instance, payload);
        } else {
          const query = {
            text: `SELECT  proargnames
            FROM    pg_catalog.pg_namespace n
            JOIN    pg_catalog.pg_proc p
            ON      p.pronamespace = n.oid
            WHERE   n.nspname = 'public' and p.proname='${payload.object}';`,
            values: []
          };
          let data = await instance.query(query);
          data = data.rows[0].proargnames;
          for (let i = 0; i < data.length; i++) {
            response.getDBFields.data.push({
              _id: data[i],
              label: data[i],
              name: data[i]
            });
          }
        }
        break;
      case 'mongo':
        break;
    }
  } catch (err) {
    console.log(err)
    logger.debug(" [ DB ] ERROR : " + err);
  }
  callback(response);
}

exports.getDBFields = getDBFields;
