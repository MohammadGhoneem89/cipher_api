const pg = require('../connectors/postgress');
const _ = require('lodash');
const logger = require('../connectors/logger').app;

module.exports = (uuid, eventname, request, response, duration, error = '') => {
  _.set(request, 'rawBody', undefined);
  _.set(request, 'body.password', undefined);
  _.set(request, 'Header.password', undefined);
  _.set(request, 'header.password', undefined);
  _.set(request, 'headersParams.password', undefined);
  _.set(request, 'JWToken', undefined)
  _.set(request, 'token', undefined)
  _.set(request, 'JWT', undefined)
  let apiplquery = `insert into "apipayloadevents" (uuid, eventname, request, response, duration, createdat,error) values ($1, $2, $3, $4, $5 ,now(),$6)`;
  let params = [uuid, eventname, request, response, duration, error];
  pg.connection().then(async (conn) => {
    let res = await conn.query(apiplquery, params);
    logger.debug({fs: 'RestController.js', func: 'handleExternalRequest'}, apiplquery);
  });
};