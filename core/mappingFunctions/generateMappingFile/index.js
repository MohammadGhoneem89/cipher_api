const generateFileContent = require('./writeToFile')
const sql = require('./DBScriptGenerators/sql');

const generateMappingFile = async function (payload, UUIDKey, route, callback, JWToken) {
    let file;
    try {
        switch (payload.database) {
            case 'postgres':
                file = sql('postgres', payload);
                break;
            case 'mssql':
                file = sql('mssql', payload);
                break;
            case 'mongo':
                break;
            default:
                throw 'Not found';
        }
        generateFileContent(payload.useCase, payload.route, file, payload.enableActions, payload.actions, callback);
    } catch (err) {
        //logger.debug(" [ DB ] ERROR : " + err);
        console.log(err)
        callback({
            error: err
        })
    }
}

/*
let data = {
    "useCase":"1",
    "route":"2",
    "database": "postgres",
    "adaptor":"adaptor4",
    "enableActions": true,
    "enablePaging": true,
    "objectType": "tables",
    "object": "invoiceResponse",
    "conditions": [
        {
            "name": "suppliername",
            "value": "name",
            "operator": "="
        },
        {
            "name": "type",
            "value": "type",
            "operator": "="
        }
    ],
    "fields": [
        {
            "name": "refNo",
            "as": "reference"
        }
    ],
      "page": {
    "pageSize": 1,
    "currentPageNo": 2
  }
}

generateMappingFile(data, '', '', (data) => {
    console.log(data)
}, '')*/

exports.generateMappingFile = generateMappingFile;
