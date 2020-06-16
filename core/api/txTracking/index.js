const pg = require('../connectors/postgress');
const logger = require('../connectors/logger').app;
const _ = require('lodash');

async function create(uuid, channel, action, payload, response = {}, duration = '0', error = '', avgRtt = 0, username, orgcode,errCode) {

  _.set(payload, 'rawBody', undefined);
  _.set(payload, 'body.password', undefined);
  _.set(payload, 'Header.password', undefined);
  _.set(payload, 'header.password', undefined);
  // _.set(payload, 'headersParams', undefined);
  _.set(payload, 'queryParams', undefined);
  _.set(payload, 'query', undefined);
  // _.set(payload, '__JWTORG', undefined);
  _.set(payload, 'JWToken', undefined)
  _.set(payload, 'token', undefined)
  _.set(payload, 'JWT', undefined)

  let apiplquery = `INSERT into "apipayload" ("uuid", "channel", "action", "payload", "createdat",response,duration,error,avgRtt,username, orgcode,errcode) VALUES($1, $2, $3, $4, now(),$5,$6,$7,$8,$9,$10,$11)`;
  let params = [uuid, channel, action, payload, response, duration, error, avgRtt, username, orgcode,errCode];
  pg.connection().then(async (conn) => {
    let res = await conn.query(apiplquery, params);
    logger.debug({fs: 'RestController.js', func: 'handleExternalRequest'}, apiplquery);
  });
}


exports.create = create;
// exports.update = update;