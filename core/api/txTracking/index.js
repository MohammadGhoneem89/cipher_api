const pg = require('../connectors/postgress');
const logger = require('../connectors/logger').app;
const config = require('../../../config');
const _ = require('lodash');
const sql = require('mssql');
const sqlserver = require('../../api/connectors/mssql');

async function create(uuid, channel, action, payload, response = {}, duration = '0', error = '', avgRtt = 0, username, orgcode, errCode) {

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

  if (config.get('database', 'postgress') == "mssql") {
    let apiplquery = `INSERT into "apipayload" ("uuid", "channel", "action", "payload", "createdat",response,duration,error,avgRtt,username, orgcode,errcode) 
    VALUES(@uuid,@channel,@action,@payload,getdate(),@response,@duration,@error,@avgRtt,@username,@orgcode,@errcode)`;
    try {
      sqlserver.connection('apipayload').then(async (conn) => {
        await conn.request()
          .input('uuid', sql.VarChar, uuid)
          .input('channel', sql.VarChar, channel)
          .input('action', sql.VarChar, action)
          .input('payload', sql.NVarChar, JSON.stringify(payload))
          .input('response', sql.NVarChar, JSON.stringify(response))
          .input('duration', sql.Int, duration)
          .input('error', sql.VarChar, error)
          .input('avgRtt', sql.VarChar, avgRtt)
          .input('username', sql.VarChar, username)
          .input('orgcode', sql.VarChar, orgcode)
          .input('errcode', sql.VarChar, errCode)
          .query(apiplquery);
        conn.close();
      }).catch((ex) => {
        console.log(ex)
      })
    } catch (e) {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", e);
    }

  } else {
    let apiplquery = `INSERT into "apipayload" ("uuid", "channel", "action", "payload", "createdat",response,duration,error,avgRtt,username, orgcode,errcode) VALUES($1, $2, $3, $4, now(),$5,$6,$7,$8,$9,$10,$11)`;
    let params = [uuid, channel, action, payload, response, duration, error, avgRtt, username, orgcode, errCode];
    pg.connection().then(async (conn) => {
      let res = await conn.query(apiplquery, params);
      logger.debug({ fs: 'RestController.js', func: 'handleExternalRequest' }, apiplquery);
    });
  }

}


exports.create = create;
// exports.update = update;