const client = require('../api/client');
let logger = require('../../lib/helpers/logger')().app;

const getDBFields = async function (payload, UUIDKey, route, callback, JWToken) {
    let response = [];
    try {
        let instance = await client.createClient(payload.adapterType === 'postgress' ? 'pg' : 'mongo', payload.connectionString);
        switch (payload.adapterType) {
            case 'postgress':
                const query = {
                    text: `select * from  ${payload.tableName} where false;`,
                    values: []
                }
                const data = await instance.query(query);
                for (let i = 0; i < data.fields.length; i++) {
                    const element = data.fields[i];
                    response.push({
                        _id: element.name,
                        name: element.name,
                        type: element.format
                    });
                }
                break;
            case 'mongo':
                break;
        }
    } catch (err) {
        logger.debug(" [ DB ] ERROR : " + err);
    }
    callback({
        dbFields: {
            data: response
        }
    }
    );
}

exports.getDBFields = getDBFields;
