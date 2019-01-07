'use strict';

const keyVaultRepo = require('../../../lib/repositories/keyVault');
const client = require('../../api/client');

function list(payload, UUIDKey, route, callback, JWToken) {
  payload.userId = JWToken._id;
  _list(payload, callback);
}

function _list(payload, callback) {
  keyVaultRepo.getDBList()
    .then((res) => {
      res.postgres = res.postgres || [];
      res.mongo = res.mongo || [];
      for (let db of res.mongo) {
        delete db.connection;
      }
      for (let db of res.postgres) {
        delete db.connection;
      }
      const response = {
        getAdaptorsList: {
          action: payload.action,
          data: res
        }
      };
      callback(response);
    });
}
const availableObjects = async function (payload, UUIDKey, route, callback, JWToken) {
  const response = {
    getAvailableObjectsList: {
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
          text: `SELECT table_name FROM information_schema.tables WHERE table_schema='public';`,
          values: []
        };
        const data = await instance.query(query);
        for(let row of data.rows){
          response.getAvailableObjectsList.data.push({
            label: row.table_name,
            value: row.table_name
          });
        }
        break;
      case 'mongo':
        break;
    }
  } catch (err) {
    console.log('----- error ', err);
  }
  callback(response);
};

exports.list = list;
exports.availableObjects  = availableObjects ;
