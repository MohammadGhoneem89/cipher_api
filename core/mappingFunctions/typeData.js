'use strict';
let logger = require('../../lib/helpers/logger')().app;
let pointer = require("json-pointer");
const typeData = require('../../lib/models/TypeData');

let typeDataOut = function (payload, UUIDKey, route, callback, JWToken) {

  logger.debug(" [ Type Data ] PAYLOAD : " + JSON.stringify(payload, null, 2));
  logger.debug(" [ Type Data ] UUID : " + UUIDKey);
  logger.debug(" [ Type Data ] Route : " + route);
  logger.debug(" [ Type Data ] JWToken : " + JSON.stringify(JWToken, null, 2));
  let TypeData = payload.typeData;
  getTypeData(TypeData, callback);

}

async function getTypeData(TypeData, getTypeData_CB) {
  try {
    const response = {
      typeData: {
        "action": "TypeData",
        "data": {}
      }
    };
    const execTypeData = await typeData.find({
      typeName: {
        $in: TypeData
      }
    }).lean(true);
    logger.debug(" [ Type Data ] Type Data IDs : " + execTypeData);
    if (execTypeData && execTypeData.length) {
      for (let [i, td] of TypeData.entries()) {
        for (let extData of execTypeData) {
          if (extData['data'][td]) {
            response.typeData.data[td] = extData['data'][td];
          }
        }
      }
    }
    getTypeData_CB(response)
  } catch (error) {
    logger.debug(" [ Type Data ] ERROR : " + error);
    getTypeData_CB(error)
  }
}



exports.typeDataOut = typeDataOut;
