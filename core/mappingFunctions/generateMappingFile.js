const fs = require('fs');
const uuid = require('uuid/v1');
const keyVaultRepo = require('../../lib/repositories/keyVault');

function generateFileContent(file, isActions, callback) {
    let actions = '';
    if(isActions){
        actions=`for(let i=0;i<response.length;i++){
            response[i]['actions']=[{
                "actionType": "COMPONENT_FUNCTION",
                "iconName": "fa fa-eye",
                "label": "View",
                "URI": [
                    "/"
                ]
            }]
        }`
    }
    let overall = `const client = require('../../api/client');
    \nconst execute = async function (payload, UUIDKey, route, callback, JWToken) {
        try{
            ${file}
            \n${actions}
            callback({
                dbExecution: {
                    data:response}});
        } catch(err){
            callback({error: err})
        }
        \n}
        \nexports.execute = execute;
    `;
    const id = uuid();
    fs.writeFile(__dirname + `/generated/${id}.js`, overall, function (err) {
        if (err) {
            callback({
                error: err
            })
        }
        callback({
            generateMappingFile: {
                data: {
                    uuid: id,
                    functionName: 'execute',
                    path: `/generated/${id}.js`
                },
                status: 'OK'
            }
        })
    });
}

const generateMappingFile = async function (payload, UUIDKey, route, callback, JWToken) {
    let file;
    try {
        const dbConfig = await keyVaultRepo.getDBConfig(payload.database, payload.adaptor);
        switch (payload.database) {
            case 'postgres':
                if(payload.objectType==='table'){
                    let conditions = '';
                    let valuesString = '';
                    for (let i = 0; i < payload.conditions.length; i++) {
                        if (conditions.length !== 0) {
                            conditions += ' AND'
                        }
                        conditions += ` "${payload.conditions[i].name}" = $${i + 1}`;
                        if (valuesString.length > 0) {
                            valuesString += ',';
                        }
                        valuesString += 'payload.' + payload.conditions[i].value;
                    }
                    let fields = '';
                    for (let i = 0; i < payload.fields.length; i++) {
                        if (fields.length !== 0) {
                            fields += ' ,'
                        }
                        fields += ` "${payload.fields[i].name}" as ${payload.fields[i].as}`;
                    }
                    let pagingData = '';
                    if (payload.enablePaging) {
                        pagingData = 'LIMIT ${payload.paging.size},${payload.paging.offset}'
                    }
                    let queryString = `select ${fields} from "${payload.object}" where ${conditions} ${pagingData};`
                    file = `                
                    let instance = await client.createClient('pg', '${dbConfig.connection}');
                    const query = {
                        text: \`${queryString}\`,
                        values: [${valuesString}]
                    }
                    let response = await instance.query(query);
                    response = response.rows;`
                } else {
                    let valuesString = '';
                    for (let i = 0; i < payload.conditions.length; i++) {
                        if (valuesString.length > 0) {
                            valuesString += ',';
                        }
                        valuesString += '${payload.' + payload.conditions[i].value+"}";
                    }
                    let fields = '';
                    for (let i = 0; i < payload.fields.length; i++) {
                        if (fields.length !== 0) {
                            fields += ' ,'
                        }
                        fields += ` ${payload.fields[i].name} as ${payload.fields[i].as}`;
                    }
                    let pagingData = '';
                    if (payload.enablePaging) {
                        pagingData = 'LIMIT ${payload.paging.size},${payload.paging.offset}'
                    }
                    let queryString = `select ${fields} from ${payload.object}(${valuesString}) ${pagingData};`
                    file = `                
                    let instance = await client.createClient('pg', '${dbConfig.connection}');
                    const query = {
                        text: \`${queryString}\`,
                        values: []
                    }
                    let response = await instance.query(query);
                    response = response.rows;`
                }
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
