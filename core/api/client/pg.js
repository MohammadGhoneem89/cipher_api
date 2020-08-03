const {Pool} = require('pg')

const crypto = require('crypto');

var PGExistingList = {};


module.exports = async function (connectionURL) {
  const hash = crypto.createHash('md5').update(connectionURL).digest("hex");
  if (PGExistingList[hash]) {
    console.log('Returning an existing Pg instance');
  } else {
    const createNewInstance = async () => {
      let pool = new Pool({
        connectionString: connectionURL,
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