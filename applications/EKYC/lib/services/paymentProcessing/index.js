'use strict';

const connector = require('../../../../../core/api/client');
const request = require('./request');
const config = require('./config.json');
let pg;

async function queryStates() {
    const query = {
        text: `select data from ${config.tableName} where (data->>'status'='004' or data->>'status'='012') and 
      to_date(data->>'date','DD/MM/YYYY')<=now() and data->>'contractStatus'='002';`,
        values: []
    }
    if (pg === undefined) {
        pg = await connector.createClient('pg', config.connectionString);
    }
    return pg.query(query);
}

async function start() {
    try {
        let data = await queryStates();
        data = data.rows;
        for (let i = 0; i < data.length; i++) {
            try {
                let resp = await request(config.url, data[i].data);
                console.log(resp);
            } catch (err) {
                console.log(err)
            }
        }
    } catch (err) {
        console.log(err);
    }
    setTimeout(start, config.interval);
}

setImmediate(start);