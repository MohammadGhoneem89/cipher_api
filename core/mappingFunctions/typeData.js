'use strict';
let logger = require('../../lib/helpers/logger')().app;
let pointer = require("json-pointer");
let typeDataOut = function (payload, UUIDKey, route, callback, JWToken) {

  logger.debug(" [ Type Data ] PAYLOAD : " + JSON.stringify(payload, null, 2));
  logger.debug(" [ Type Data ] UUID : " + UUIDKey);
  logger.debug(" [ Type Data ] Route : " + route);
  logger.debug(" [ Type Data ] JWToken : " + JSON.stringify(JWToken, null, 2));
  let typeData = payload.typeData;
  getTypeData(typeData, callback);

}

function getTypeData(typeData, getTypeData_CB) {
  let response = {
    typeData: {
      "action": "TypeData",
      "data": {}
    }
  };

  logger.debug(" [ Type Data ] Type Data IDs : " + typeData);

  global.db.select("TypeData", {
    "typeName": {
      "$in": typeData
    }
  }, { "data": 1 }, function (err, typeDataData) {
    console.log(JSON.stringify(typeData))
    console.log(JSON.stringify(typeDataData))
    if (err) {
      logger.debug(" [ Type Data ] ERROR : " + err);
      getTypeData_CB(response);
    }
    else {
      for (let i = 0; i < typeData.length; i++) {
        for (let key in typeDataData[i].data) {
          response.typeData.data[key] = typeDataData[i].data[key];
        }
      }
      getTypeData_CB(response);
    }
  });
}


exports.typeDataOut = typeDataOut;

