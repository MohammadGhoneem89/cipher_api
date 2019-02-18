'use strict';

const keyVaultRepo = require('../../../lib/repositories/keyVault');
const tableFieldsRepo = require('../../../lib/repositories/tableFields');
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
  let query = {
    adaptor: payload.adaptor,
    type: payload.objectType
  };
  tableFieldsRepo.find(query)
    .then((res)=>{
      response.getAvailableObjectsList.data = res;
      callback(response);
    });

};

exports.list = list;
exports.availableObjects  = availableObjects ;
