'use strict';

const pg = require('../../../../core/api/connectors/postgress');

const listProcedures = async (payload, UUIDKey, route, callback, JWToken) => {
    const response = {
        listProcedures: {
            action: 'listProcedures',
            data: {
                message: {
                    status: 'OK',
                    errorDescription: 'List of Store Procedures',
                    displayToUser: false
                },
                searchResult: []
            }
        }
    };
    try {
        const conn = await pg.connection()
        let query = `SELECT  p.proname FROM pg_catalog.pg_namespace n JOIN pg_catalog.pg_proc p ON p.pronamespace = n.oid WHERE n.nspname = 'public';`;
        console.log('query', query)
        const execQuery = await conn.query(query);
        let object = [];
        if (execQuery && execQuery['rows']) {
            for (let row of execQuery['rows']) {
                object.push({
                    label: row.proname,
                    value: row.proname
                });
            }
            response.listProcedures.data.searchResult = object;
        }
        callback(response);
    } catch (error) {
        response.listProcedures.data.message.status = 'Error';
        response.listProcedures.data.message.errorDescription = error.message;
        response.listProcedures.data.message.displayToUser = true;
        callback(response);
        throw new Error(error);
    }
};

exports.listProcedures = listProcedures;
