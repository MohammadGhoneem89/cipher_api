const pg = require('../connectors/postgress');
const logger = require('../connectors/logger').app;

async function create(uuid, channel, action, payload, response = {}, duration = '0', error = '') {
  let apiplquery = `INSERT into "apipayload" ("uuid", "channel", "action", "payload", "createdat",response,duration,error) VALUES($1, $2, $3, $4, now(),$5,$6,$7)`;
  let params = [uuid, channel, action, payload, response, duration, error];
  pg.connection().then(async (conn) => {
    let res = await conn.query(apiplquery, params);
    logger.debug({fs: 'RestController.js', func: 'handleExternalRequest'}, apiplquery);
  });
}


exports.create = create;
// exports.update = update;