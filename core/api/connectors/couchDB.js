'use strict';

// const CouchDB = require('node-couchdb');
const config = require('../../../config/index');
const crypto = require('../../../lib/helpers/crypto');

let couch;

module.exports = (() => {
  couch = couch ? couch : couchDB();
  return couch;

  function couchDB() {
    // const pass = crypto.decrypt(config.get('couch.password'));
    // const username = config.get('couch.username');
    // return new CouchDB({
    //   host: config.get('couch.host'),
    //   protocol: config.get('couch.protocol'),
    //   port: config.get('couch.port'),
    //   timeout: 150000,
    //   auth: {
    //     user: username,
    //     pass: pass
    //   }
    // });
  }
})();
