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
  getTypeData(TypeData, callback, payload);

}

async function getTypeData(TypeData, getTypeData_CB, payload) {
  try {
    const response = {
      [payload.actionType]: {
        "action": payload.actionType,
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
            let array = []
            if (payload && payload.lang == 'AR') {
              console.log(JSON.stringify(extData['data'][td]))
              extData['data'][td].forEach(element => {
                if (element.labelAr) {
                  element.label = element.labelAr
                  delete element.labelAr
                }
                array.push(element)
              });
            } else {
              array = extData['data'][td];
            }
            response[payload.actionType].data[td] = array;


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
