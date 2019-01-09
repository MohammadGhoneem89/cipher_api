const generateFileContent = require('./writeToFile')
const postgres = require('./DBScriptGenerators/postgress');

const generateMappingFile = async function (payload, UUIDKey, route, callback, JWToken) {
    let file;
    try {
        switch (payload.database) {
            case 'postgres':
                file = postgres(payload);
                break;
            case 'mongo':
                break;
            default:
                throw 'Not found';
        }
        generateFileContent(file, payload.enableActions, callback);
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
    "database": "postgres",
    "adaptor":"adaptor4",
    "enableActions": true,
    "enablePaging": true,
    "objectType": "tables",
    "object": "invoiceResponse",
    "conditions": [
        {
            "name": "suppliername",
            "value": "name"
        },
        {
            "name": "type",
            "value": "type"
        }
    ],
    "fields": [
        {
            "name": "refNo",
            "as": "reference"
        }
    ]
}

generateMappingFile(data, '', '', (data) => {
    console.log(data)
}, '')*/

exports.generateMappingFile = generateMappingFile;
