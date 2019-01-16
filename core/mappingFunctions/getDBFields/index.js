let logger = require('../../../lib/helpers/logger')().app;
const TableFields = require('../../../lib/models/TableFields');

const getDBFields = async function (payload, UUIDKey, route, callback, JWToken) {
  const response = {
    getDBFields: {
      action: payload.action,
      data: [],
      outputFields: []
    }
  };
  try {
    let data = await TableFields.findOne({
      adaptor: payload.adaptor,
      name: payload.object,
      type: payload.objectType
    }).lean();
    response.getDBFields.data = data.fields;
    if (payload.objectType === 'storedProcedure') {
      response.getDBFields.outputFields = data.outputs;
    } else {
      response.getDBFields.outputFields = data.fields;
    }
  } catch (err) {
    console.log(err)
    logger.debug(" [ DB ] ERROR : " + err);
  }
  callback(response);
}

exports.getDBFields = getDBFields;

let table = [
  {
    "name" : "block_num",
    "type" : {
        "type" : "BIGINT",
        "allowNull" : false
    }
}, 
{
    "name" : "txnid",
    "typeData" : {
        "type" : "STRING",
        "allowNull" : false,
        "validate" : {}
    }
}, 
{
    "name" : "status",
    "typeData" : {
        "type" : "STRING",
        "allowNull" : false,
        "defaultValue" : "INVALID"
    }
}, 
{
    "name" : "key",
    "typeData" : {
        "type" : "STRING",
        "allowNull" : false,
        "unique" : true
    }
}
]