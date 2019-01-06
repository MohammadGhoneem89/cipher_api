const client = require('../api/client');
let logger = require('../../lib/helpers/logger')().app;
const keyVaultRepo = require('../../lib/repositories/keyVault');

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
                const query = {
                    text: `SELECT column_name
                  FROM information_schema.columns 
                  WHERE table_name='${payload.table}';`,
                    values: []
                };
                const data = await instance.query(query);
                  for(let row of data.rows){
                    response.getDBFields.data.push({
                      label: row.column_name,
                      value: row.column_name
                    });
                  }
                break;
            case 'mongo':
                break;
        }
    } catch (err) {
        logger.debug(" [ DB ] ERROR : " + err);
    }
    callback(response);
}

exports.getDBFields = getDBFields;
