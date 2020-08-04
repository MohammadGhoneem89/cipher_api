const { Pool } = require('pg')

const crypto = require('crypto');
const config = require('../../../config')
var PGExistingList = {};


module.exports = async function (connectionURL, issecure = false) {
  const hash = crypto.createHash('md5').update(connectionURL).digest("hex");
  if (PGExistingList[hash]) {
    console.log('Returning an existing Pg instance');
  } else {

    let litmusSSL = connectionURL ? issecure : config.get('sslForDatabase', issecure)
    const createNewInstance = async () => {
      let pool = new Pool({
        connectionString: connectionURL,
        ssl: litmusSSL ? {
          rejectUnauthorized: false
        } : undefined,
      });
      await pool.connect();
      PGExistingList[hash] = pool;
      pool.on('error', async (err) => {
        console.error('something bad has happened!', err.stack);
        await createNewInstance();
      })
    };
    console.log('Creating new a Pg instance');
    await createNewInstance();
  }
  return PGExistingList[hash];

};