const pg = require('../connectors/postgress');
const logger = require('../connectors/logger').app;

module.exports = (uuid, eventname, request, response, duration,error='') => {
  let apiplquery = `insert into "apipayloadevents" (uuid, eventname, request, response, duration, createdat,error) values ($1, $2, $3, $4, $5 ,now(),$6)`;
  let params = [uuid, eventname, request, response, duration,error];
  pg.connection().then(async (conn) => {
    let res = await conn.query(apiplquery, params);
    logger.debug({fs: 'RestController.js', func: 'handleExternalRequest'}, apiplquery);
  });
};