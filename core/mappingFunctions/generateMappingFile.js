const fs = require('fs');
const uuid = require('uuid/v1');

function generateFileContent(file, callback) {
    let overall = `const client = require('../../api/client');
    \nconst execute = async function (payload, UUIDKey, route, callback, JWToken) {
        try{
            ${file}
            callback({
                data: response});
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
            response: {
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
        switch (payload.adapterType) {
            case 'postgress':
                let conditions = '';
                let valuesString = '';
                for (let i = 0; i < payload.conditions.length; i++) {
                    if (conditions.length !== 0) {
                        conditions += ' AND'
                    }
                    conditions += ` ${payload.conditions[i].name} = $${i + 1}`;
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
                    fields += ` ${payload.fields[i].name} as ${payload.fields[i].as}`;
                }

                let queryString = `select ${fields} from ${payload.tableName} where ${conditions};`
                file = `                
                let instance = await client.createClient('pg', payload.connectionString);
                const query = {
                    text: '${queryString}',
                    values: [${valuesString}]
                }
                let response = await instance.query(query);
                response = response.rows;`
                break;
            case 'mongo':
                break;
        }
        generateFileContent(file, callback);
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
    adapterType: 'pg',
    connectionString: 'postgresql://Admin:avanza123@104.211.155.19:5432/invoiceFinancing',
    tableName: 'invoiceResponse',
    conditions: [{
        name: 'suppliername',
        value: 'name'
    }, {
        name: 'type',
        value: 'type'
    }],
    fields: [{
        name: 'refNo',
        as: 'reference'
    }]
}

generateMappingFile(data, '', '', (data) => {
    console.log(data)
}, '')
*/
exports.generateMappingFile = generateMappingFile;
